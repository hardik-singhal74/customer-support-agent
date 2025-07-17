const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting server...');
console.log('Environment PORT:', process.env.PORT);
console.log('Using PORT:', PORT);

app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
  console.log('Root route accessed');
  res.sendFile(path.join(__dirname, 'chat-widget-test.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT, timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server successfully started on port ${PORT}`);
  console.log(`Server listening on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});
