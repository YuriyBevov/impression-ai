const express = require('express');
const http = require('http');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---------- In-memory storage ----------
const translations = new Map(); // id -> { status, result? }

// ---------- Helpers ----------
const https = require('https');

function callN8nWebhook(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'n8n.yuriybevov.ru',
      path: '/webhook/translate',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 180000 // 3 min
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          console.log('[n8n] raw response status=' + res.statusCode + ' body[:200]=' + JSON.stringify(parsed).slice(0,200));
          resolve({ status: res.statusCode, body: parsed });
        } catch (parseErr) {
          console.error('[n8n] JSON parse error:' + parseErr.message + ' body=' + body.slice(0,200));
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => { console.error('[n8n] request error:' + err.message); reject(err); });
    req.on('timeout', () => { console.error('[n8n] timeout'); req.destroy(); reject(new Error('n8n timeout')); });
    req.write(data);
    req.end();
  });
}

// ---------- Routes ----------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login
app.post('/webhook/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'admin') {
    const token = 'impression-admin-token-' + Date.now();
    return res.json({
      token,
      user: { id: '1', username: 'admin', role: 'admin' }
    });
  }
  return res.status(401).json({
    success: false,
    error: 'Неверное имя пользователя или пароль'
  });
});

// ---------- Async translation ----------

// POST /api/translate/start — start translation, return ID immediately
app.post('/api/translate/start', async (req, res) => {
  const body = req.body || {};
  const id = crypto.randomUUID();

  translations.set(id, { status: 'processing', progress: 0, request: body });

  // Respond to frontend immediately
  res.json({ id, status: 'processing' });

  // Fire-and-forget: call n8n in background
  try {
    const n8nBody = {
      ...body,
      callback_id: id,
      webhook_domain: 'https://impression.yuriybevov.ru'
    };

    const n8nResponse = await callN8nWebhook(n8nBody);

    console.log('[n8n] response status=' + n8nResponse.status + ' body_type=' + typeof n8nResponse.body + ' isArray=' + Array.isArray(n8nResponse.body));
    if (Array.isArray(n8nResponse.body) && n8nResponse.body.length > 0) {
      console.log('[n8n] body[0] keys=' + Object.keys(n8nResponse.body[0]).join(','));
    }

    // Extract translation result from n8n webhook response
    // n8n returns: [{ translated_text: ..., changes: [...] }]
    let result = { status: 'completed' };
    if (n8nResponse.body) {
      const body = n8nResponse.body;
      if (Array.isArray(body) && body[0]) {
        // n8n returns an array with one item
        result = body[0];
      } else if (typeof body === 'object' && body.json) {
        result = body.json;
      } else if (typeof body === 'object') {
        result = body;
      }
    }

    const entry = translations.get(id);
    if (entry && entry.status === 'processing') {
      translations.set(id, {
        status: 'completed',
        request: body,
        result
      });
    }
  } catch (err) {
    if (!translations.has(id)) return;
    const entry = translations.get(id);
    if (entry && entry.status === 'processing') {
      translations.set(id, {
        status: 'error',
        request: body,
        error: err.message || 'Ошибка перевода'
      });
    }
    console.error(`[${id}] n8n error:`, err.message);
  }
});

// GET /api/translate/status/:id — poll status
app.get('/api/translate/status/:id', (req, res) => {
  const id = req.params.id;
  const entry = translations.get(id);

  if (!entry) {
    return res.status(404).json({ error: 'Translation not found' });
  }

  const response = {
    id,
    status: entry.status
  };

  if (entry.status === 'completed') {
    response.result = entry.result;
  } else if (entry.status === 'error') {
    response.error = entry.error;
  }

  res.json(response);
});

// POST /api/translate/callback — n8n calls this when done (backup/fallback path)
// Main result now comes from the webhook response directly
app.post('/api/translate/callback', (req, res) => {
  const body = req.body || {};
  const id = body.callback_id || body.id;

  if (!id || !translations.has(id)) {
    return res.status(404).json({ error: 'Translation not found' });
  }

  // Only apply if still processing (webhook response hasn't arrived yet)
  const entry = translations.get(id);
  if (entry && entry.status === 'processing') {
    const hasError = body.status === 'error' || body.error;
    translations.set(id, {
      status: hasError ? 'error' : 'completed',
      request: entry.request,
      result: hasError ? null : body,
      error: hasError ? (body.error || body.message) : null
    });
    console.log(`[${id}] Callback received — ${hasError ? 'error' : 'completed'}`);
  }

  res.json({ ok: true });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth server running on http://127.0.0.1:${PORT}`);
});
