const db = require('./db');

db.exec(`
  DROP TABLE IF EXISTS articles;

  CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    link TEXT UNIQUE,
    source TEXT,
    pubDate TEXT,
    content TEXT,
    imageUrl TEXT
  );
`);

console.log("✅ Table recreated with imageUrl column.");