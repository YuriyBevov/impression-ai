import express from 'express';

const app = express();
const PORT = 3001;
const HOST = '127.0.0.1';

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

app.post('/webhook/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};

  if (username === 'admin' && password === 'admin') {
    return res.json({
      token: 'impression-dev-token-2026',
      user: {
        id: 1,
        username: 'admin',
        role: 'admin',
      },
    });
  }

  return res.status(401).json({ error: 'Unauthorized' });
});

app.listen(PORT, HOST, () => {
  console.log(`Impression auth server listening on http://${HOST}:${PORT}`);
});
