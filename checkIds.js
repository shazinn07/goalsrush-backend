const db = require('./db');

const rows = db.prepare('SELECT id, title FROM articles LIMIT 10').all();
console.log(rows);