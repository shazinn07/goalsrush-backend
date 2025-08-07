const Database = require('better-sqlite3');
const db = new Database('news.db'); // or 'articles.db'
module.exports = db;
