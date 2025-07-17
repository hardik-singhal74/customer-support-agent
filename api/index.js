const express = require('express');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/inlinehelp', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'chat-widget-test.html'));
});

app.get('/tinytalk', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'tinytalk-chat.html'));
});

app.get('/tidio', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'tidio-chat.html'));
});

app.get('/supermoon', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'supermoon-chat.html'));
});

app.get('/answerhq', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'answerhq-chat.html'));
});

app.get('/chatbase', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'chatbase-chat.html'));
});

app.post('/api/verify-user', (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const secret = 'd5rq5dwds8zbx4kygqemn07d28j3we7k';
  const hash = crypto.createHmac('sha256', secret).update(userId).digest('hex');
  
  res.json({ 
    userId: userId,
    hash: hash,
    timestamp: new Date().toISOString()
  });
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