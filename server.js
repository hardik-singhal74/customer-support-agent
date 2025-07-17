const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging
console.log('Starting server...');
console.log('PORT:', PORT);

// Serve static files
app.use(express.static('.'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/inlinehelp', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat-widget-test.html'));
});

app.get('/tinytalk', (req, res) => {
  res.sendFile(path.join(__dirname, 'tinytalk-chat.html'));
});

app.get('/tidio', (req, res) => {
  res.sendFile(path.join(__dirname, 'tidio-chat.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});