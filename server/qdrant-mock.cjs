/**
 * Qdrant mock server — заменяет Qdrant, когда он недоступен.
 * Запоминает созданные коллекции и точки в памяти.
 * Запуск: node qdrant-mock.cjs
 * Порт: 16333
 */
const http = require('http');

const PORT = 16333;

// In-memory storage
const collections = new Map();

// Seed data
const seedCollections = ['glossary_en', 'examples_en', 'clients_en', 'glossary_es', 'examples_es', 'clients_es'];
const seedPoints = {
  glossary_en: [
    { id: 1, payload: { source_term: 'Agreement', target_term: 'Договор/Соглашение', category: 'legal', note: 'General term for contracts', tags: ['legal', 'contract'] } },
    { id: 2, payload: { source_term: 'Liability', target_term: 'Ответственность', category: 'legal', note: 'Legal obligation', tags: ['legal'] } },
    { id: 3, payload: { source_term: 'Indemnification', target_term: 'Возмещение убытков', category: 'legal', note: 'Compensation for damages', tags: ['legal', 'compensation'] } },
    { id: 4, payload: { source_term: 'Force Majeure', target_term: 'Форс-мажор', category: 'legal', note: 'Circumstances beyond control', tags: ['legal', 'contract'] } },
    { id: 5, payload: { source_term: 'Confidentiality', target_term: 'Конфиденциальность', category: 'legal', note: 'NDA related', tags: ['legal', 'nda'] } },
  ],
  clients_en: [
    { id: 1, payload: { source_term: 'ООО Ромашка', target_term: 'Romashka LLC', category: 'client', note: 'Default client', tags: ['client'] } },
  ],
  glossary_es: [
    { id: 1, payload: { source_term: 'Agreement', target_term: 'Acuerdo/Contrato', category: 'legal', note: 'Término general para contratos', tags: ['legal', 'contract'] } },
  ],
};

// Initialize seed data
for (const name of seedCollections) {
  if (!collections.has(name)) {
    collections.set(name, {
      name,
      points_count: seedPoints[name] ? seedPoints[name].length : 0,
      points: new Map(),
    });
  }
}

for (const [name, points] of Object.entries(seedPoints)) {
  if (collections.has(name)) {
    for (const point of points) {
      collections.get(name).points.set(point.id, point);
    }
  }
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
  });
}

// Respond with Qdrant-style JSON
function respond(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function ok(res, data) {
  respond(res, 200, data);
}

// Match URL path
function match(pattern, url) {
  const regex = new RegExp('^' + pattern.replace(/:[a-zA-Z_]+/g, '([^/]+)') + '$');
  const match = url.match(regex);
  if (match) {
    return match.slice(1); // captured groups
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const url = req.url;

  try {
    // GET /collections — list all
    if ((url === '/collections' || url === '/api/qdrant/collections') && req.method === 'GET') {
      const result = Array.from(collections.values()).map(c => ({ name: c.name }));
      return ok(res, { result: { collections: result }, status: 'ok', time: 0.001 });
    }

    // PUT /collections/:name — create or update collection
    const createMatch = match('/collections/:name', url);
    if (createMatch && req.method === 'PUT') {
      const name = createMatch[0];
      if (!collections.has(name)) {
        collections.set(name, { name, points_count: 0, points: new Map() });
      }
      return ok(res, { result: true, status: 'ok', time: 0.001 });
    }

    // GET /collections/:name — collection detail
    const detailMatch = match('/collections/:name', url);
    if (detailMatch && req.method === 'GET') {
      const name = detailMatch[0];
      const col = collections.get(name);
      if (col) {
        return ok(res, { result: { name: col.name, points_count: col.points.size }, status: 'ok', time: 0.001 });
      }
      return ok(res, { result: { name, points_count: 0 }, status: 'ok', time: 0.001 });
    }

    // POST /collections/:name/points/scroll — fetch points
    const scrollMatch = match('/collections/:name/points/scroll', url);
    if (scrollMatch && req.method === 'POST') {
      const name = scrollMatch[0];
      const col = collections.get(name);
      const points = col ? Array.from(col.points.values()) : [];
      return ok(res, { result: { points, next_page_offset: null }, status: 'ok', time: 0.001 });
    }

    // PUT /collections/:name/points — upsert points
    const upsertMatch = match('/collections/:name/points', url);
    if (upsertMatch && req.method === 'PUT') {
      const name = upsertMatch[0];
      if (!collections.has(name)) {
        collections.set(name, { name, points_count: 0, points: new Map() });
      }
      const body = await parseBody(req);
      const pts = body.points || [];
      for (const p of pts) {
        const id = p.id || Date.now();
        collections.get(name).points.set(id, p);
      }
      return ok(res, { result: { operation_id: 0, status: 'completed' }, status: 'ok', time: 0.001 });
    }

    // POST /collections/:name/points/delete — delete points
    const deleteMatch = match('/collections/:name/points/delete', url);
    if (deleteMatch && req.method === 'POST') {
      const name = deleteMatch[0];
      const body = await parseBody(req);
      const ids = body.points || [];
      const col = collections.get(name);
      if (col) {
        for (const id of ids) {
          col.points.delete(id);
        }
      }
      return ok(res, { result: { operation_id: 0, status: 'completed' }, status: 'ok', time: 0.001 });
    }

    // Fallback
    respond(res, 404, { error: 'Not found', path: url, method: req.method });

  } catch (err) {
    respond(res, 500, { error: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Qdrant mock server running on http://127.0.0.1:${PORT}`);
  console.log(`Seed collections: ${Array.from(collections.keys()).join(', ')}`);
});
