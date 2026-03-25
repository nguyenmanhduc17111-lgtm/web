const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

db.run("ALTER TABLE cart ADD COLUMN variant_id INTEGER", (err) => {
    if (err) console.error("Lỗi khi thêm cột (có thể đã tồn tại):", err.message);
    else console.log("✅ Đã thêm cột variant_id vào bảng cart");
    db.close();
});