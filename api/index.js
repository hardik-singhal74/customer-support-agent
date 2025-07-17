const express = require('express');
const path = require('path');

const app = express();

// Serve static files from root directory
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/tinytalk', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'tinytalk-chat.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// Export for Vercel
module.exports = app;