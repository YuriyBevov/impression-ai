const express = require('express');
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// ---------- Persistent storage ----------
const DATA_FILE = path.join(__dirname, 'translations.json');

function loadTranslations() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      const arr = JSON.parse(data);
      const map = new Map();
      for (const item of arr) {
        map.set(item.id, item);
      }
      return map;
    }
  } catch (e) {
    console.error('Error loading translations.json:', e.message);
  }
  return new Map();
}

function saveTranslations() {
  try {
    const arr = [];
    for (const [id, entry] of translations) {
      arr.push({ id, ...entry });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving translations.json:', e.message);
  }
}

const translations = loadTranslations();

app.use(express.json({ limit: '10mb' }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---------- Helpers ----------
const https = require('https');

function callN8nWebhook(n8nBody) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(n8nBody);
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
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          console.log('[n8n] response status=' + res.statusCode);
          resolve({ status: res.statusCode, body: parsed });
        } catch (parseErr) {
          console.error('[n8n] JSON parse error:' + parseErr.message);
          resolve({ status: res.statusCode, body: raw });
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
  const reqBody = req.body || {};
  const id = crypto.randomUUID();

  // Store the original request
  const entry = {
    id,
    status: 'processing',
    progress: 0,
    date: new Date().toISOString(),
    client_id: reqBody.client_id || '',
    client_name: reqBody.client_name || '',
    source_text: reqBody.source_text || '',
    translation_pair: reqBody.translation_pair || 'ru-en',
    source_lang: reqBody.source_lang || (reqBody.translation_pair || 'ru-en').split('-')[0] || 'ru',
    target_lang: reqBody.target_lang || (reqBody.translation_pair || 'ru-en').split('-')[1] || 'en'
  };
  translations.set(id, entry);
  saveTranslations();

  // Respond to frontend immediately
  res.json({ id, status: 'processing' });

  // Fire-and-forget: call n8n in background
  try {
    const n8nBody = {
      ...reqBody,
      callback_id: id,
      webhook_domain: 'https://impression.yuriybevov.ru'
    };

    const n8nResponse = await callN8nWebhook(n8nBody);

    // Extract translation result
    let result = { status: 'completed' };
    if (n8nResponse.body) {
      const rbody = n8nResponse.body;
      if (Array.isArray(rbody) && rbody[0]) {
        result = rbody[0];
      } else if (typeof rbody === 'object' && rbody.json) {
        result = rbody.json;
      } else if (typeof rbody === 'object') {
        result = rbody;
      }
    }

    const current = translations.get(id);
    if (current && current.status === 'processing') {
      translations.set(id, {
        ...current,
        status: 'completed',
        translated_text: result.translated_text || '',
        model: result.model || 'gpt-4.1',
        cost: result.cost || 0,
        tokens: result.tokens || 0,
        processing_time: result.processing_time || 0,
        result // keep full result for backward-compat /api/translate/status/:id
      });
      saveTranslations();
    }
  } catch (err) {
    const current = translations.get(id);
    if (current && current.status === 'processing') {
      translations.set(id, {
        ...current,
        status: 'error',
        error: err.message || 'Ошибка перевода'
      });
      saveTranslations();
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

  // Return in the format the frontend expects
  if (entry.status === 'completed') {
    res.json({
      id,
      status: 'completed',
      result: {
        translated_text: entry.translated_text || '',
        client_name: entry.client_name || '',
        source_text: entry.source_text || '',
        model: entry.model || 'gpt-4.1',
        cost: entry.cost || 0,
        tokens: entry.tokens || 0,
        processing_time: entry.processing_time || 0
      }
    });
  } else if (entry.status === 'error') {
    res.json({
      id,
      status: 'error',
      error: entry.error || 'Ошибка перевода'
    });
  } else {
    res.json({
      id,
      status: 'processing'
    });
  }
});

// GET /api/translate/history — list all completed translations
app.get('/api/translate/history', (req, res) => {
  const clientId = req.query.client_id;
  const all = [];

  for (const [id, entry] of translations) {
    if (entry.status !== 'completed') continue;
    if (clientId && entry.client_id !== clientId) continue;

    all.push({
      id: entry.id,
      date: entry.date,
      client_id: entry.client_id || '',
      client_name: entry.client_name || '',
      source_lang: entry.source_lang || 'ru',
      target_lang: entry.target_lang || 'en',
      source_text: entry.source_text || '',
      translated_text: entry.translated_text || '',
      model: entry.model || 'gpt-4.1',
      cost: entry.cost || 0,
      tokens: entry.tokens || 0
    });
  }

  // Reverse chronological order
  all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json(all);
});

// GET /api/translate/history/:id — get single translation by id
app.get('/api/translate/history/:id', (req, res) => {
  const id = req.params.id;
  const entry = translations.get(id);

  if (!entry) {
    return res.status(404).json({ error: 'Translation not found' });
  }

  res.json({
    id: entry.id,
    date: entry.date,
    status: entry.status,
    client_id: entry.client_id || '',
    client_name: entry.client_name || '',
    source_lang: entry.source_lang || 'ru',
    target_lang: entry.target_lang || 'en',
    source_text: entry.source_text || '',
    translated_text: entry.translated_text || '',
    translation_pair: entry.translation_pair || 'ru-en',
    model: entry.model || 'gpt-4.1',
    cost: entry.cost || 0,
    tokens: entry.tokens || 0,
    processing_time: entry.processing_time || 0
  });
});

// POST /api/translate/callback — n8n calls this when done (backup/fallback path)
app.post('/api/translate/callback', (req, res) => {
  const body = req.body || {};
  const id = body.callback_id || body.id;

  if (!id || !translations.has(id)) {
    return res.status(404).json({ error: 'Translation not found' });
  }

  const current = translations.get(id);
  if (current && current.status === 'processing') {
    const hasError = body.status === 'error' || body.error;
    const update = {
      ...current,
      status: hasError ? 'error' : 'completed',
      error: hasError ? (body.error || body.message) : null
    };
    if (!hasError) {
      update.translated_text = body.translated_text || body.result?.translated_text || '';
      update.model = body.model || body.result?.model || 'gpt-4.1';
      update.cost = body.cost || body.result?.cost || 0;
      update.tokens = body.tokens || body.result?.tokens || 0;
      update.processing_time = body.processing_time || body.result?.processing_time || 0;
    }
    translations.set(id, update);
    saveTranslations();
    console.log(`[${id}] Callback received — ${hasError ? 'error' : 'completed'}`);
  }

  res.json({ ok: true });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth server running on http://127.0.0.1:${PORT}`);
});
