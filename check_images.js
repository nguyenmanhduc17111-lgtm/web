const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

db.all('SELECT * FROM product_images', (err, rows) => {
    if (err) {
        console.error('Lỗi:', err.message);
    } else {
        console.log('Dữ liệu trong bảng product_images:');
        console.log(rows);
    }
    db.close();
});