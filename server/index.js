// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// const analyzeRouter = require('./analyze');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve demo assets statically
// Upload your demo assets to server/public/demo/demo-video.mp4 and demo-data.csv
app.use('/demo', express.static(path.join(__dirname, 'public', 'demo')));

// API Routes
// app.use('/api/analyze', analyzeRouter);

// Demo assets endpoint - returns URLs for demo video and CSV
app.get('/api/demo', (req, res) => {
  res.json({
    videoUrl: '/demo/demo-video.mp4',
    csvUrl: '/demo/demo-data.csv',
    note: 'Place your demo assets at server/public/demo/demo-video.mp4 and demo-data.csv',
    thingspeak: {
      channelId: '2725064',
      readApiKey: 'OO56NIHVPTB1BSY0',
      note: 'Demo ThingSpeak credentials - replace with your own'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Analysis server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/analyze`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
});

module.exports = app;
