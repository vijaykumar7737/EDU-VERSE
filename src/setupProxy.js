const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  // Dynamic proxy configuration with multiple fallback strategies
  let backendPort;
  let portSource = 'fallback';
  
  // Strategy 1: Try to read from port-config.json (created by server)
  try {
    const portConfigPath = path.join(__dirname, '../public/port-config.json');
    if (fs.existsSync(portConfigPath)) {
      const portConfig = JSON.parse(fs.readFileSync(portConfigPath, 'utf8'));
      backendPort = portConfig.backendPort;
      portSource = 'port-config.json';
    }
  } catch (error) {
    console.log('⚠️ Could not read port-config.json, trying environment variables...');
  }
  
  // Strategy 2: Environment variables
  if (!backendPort) {
    backendPort = process.env.REACT_APP_BACKEND_PORT || 
                 process.env.BACKEND_PORT;
    if (backendPort) {
      portSource = process.env.REACT_APP_BACKEND_PORT ? 'REACT_APP_BACKEND_PORT' : 'BACKEND_PORT';
    }
  }
  
  // Strategy 3: Fallback port
  if (!backendPort) {
    backendPort = '62000'; // Updated fallback to match new default
    portSource = 'fallback';
  }
  
  const target = `http://localhost:${backendPort}`;
  
  console.log(`🔗 Setting up proxy to backend at ${target}`);
  console.log(`📡 Backend port source: ${portSource}`);
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: target,
      changeOrigin: true,
      logLevel: 'warn',
      onError: (err, req, res) => {
        console.log(`❌ Proxy error for ${req.url}:`, err.message);
        console.log(`💡 Make sure backend is running on ${target}`);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying ${req.method} ${req.url} to ${target}${req.url}`);
      }
    })
  );
  
  app.use(
    '/imgproxy',
    createProxyMiddleware({
      target: 'https://images.unsplash.com',
      changeOrigin: true,
      logLevel: 'warn',
      pathRewrite: { '^/imgproxy': '' },
      onError: (err, req, res) => {
        console.log(`❌ Image proxy error for ${req.url}:`, err.message);
        try { res.status(502).end(); } catch (_) {}
      },
      onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('Accept', 'image/*');
        proxyReq.setHeader('Referer', 'https://unsplash.com');
      }
    })
  );
  
  console.log('✅ Image proxy configured for /imgproxy routes');
  console.log('✅ Proxy middleware configured for /api routes');
};