#!/bin/sh
cd /app/frontend/dist

# Create a simple Node.js proxy server
cat > proxy-server.js << 'EOF'
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Create a proxy to backend
const proxy = httpProxy.createProxyServer({ target: 'http://localhost:3001' });

const server = http.createServer((req, res) => {
  // Log all requests
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Proxy API requests to backend
  if (req.url.startsWith('/api')) {
    console.log(`Proxying to backend: ${req.url}`);
    proxy.web(req, res, (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error');
    });
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, serve index.html for SPA routing
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }

    // Set content type based on file extension
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log('Frontend server running on port 3000');
  console.log('Proxying /api requests to http://localhost:3001');
});
EOF

# Start the proxy server (http-proxy is already installed globally)
node proxy-server.js
