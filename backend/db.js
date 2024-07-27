// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite3');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Создание таблицы камер
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS cameras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      x INTEGER,
      y INTEGER,
      drawing TEXT,
      floor INTEGER,
      switchName TEXT,
      port TEXT,
      cabinetName TEXT,
      ipAddress TEXT,
      vlan TEXT
    )
  `);
});

module.exports = db;
