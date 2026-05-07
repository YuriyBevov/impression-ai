const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Login endpoint
app.post('/webhook/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (username === 'admin' && password === 'admin') {
    const token = 'impression-admin-token-' + Date.now();
    return res.json({
      token,
      user: {
        id: '1',
        username: 'admin',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Неверное имя пользователя или пароль'
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Auth server running on http://127.0.0.1:${PORT}`);
});
