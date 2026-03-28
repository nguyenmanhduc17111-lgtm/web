const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

db.all('SELECT * FROM stores', (err, rows) => {
    if (err) console.error('Lỗi:', err.message);
    else console.log('Dữ liệu trong bảng stores:', rows);
    db.close();
});