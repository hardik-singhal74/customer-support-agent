const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

console.log('Starting server...');
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);
console.log('Current directory:', __dirname);
console.log('Process version:', process.version);

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  console.log('Root route accessed');
  const filePath = path.join(__dirname, 'chat-widget-test.html');
  console.log('Sending file:', filePath);
  res.sendFile(filePath);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    port: PORT, 
    env: process.env.NODE_ENV,
    node_version: process.version,
    timestamp: new Date().toISOString() 
  });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`Server successfully started on ${HOST}:${PORT}`);
  console.log('Server is ready to accept connections');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
