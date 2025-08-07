const express = require('express');
const fetchNews = require('./fetchNews');
const db = require('./db');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 3000;

// Fetch every 40 mins
cron.schedule('*/40 * * * *', fetchNews);

// Endpoint to get articles
app.get('/news', (req, res) => {
  const articles = db.prepare('SELECT * FROM articles ORDER BY pubDate DESC').all();
  res.json(articles);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  fetchNews(); // Initial fetch on start
});
