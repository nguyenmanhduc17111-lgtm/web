const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../shopdb.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Lỗi kết nối database:', err.message);
    } else {
        console.log('✅ Đã kết nối SQLite database:', DB_PATH);
    }
});

db.run('PRAGMA foreign_keys = ON');

module.exports = db;