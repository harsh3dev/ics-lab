const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./auth.db');

db.all('SELECT username, password FROM users', [], (err, rows) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(rows);
});