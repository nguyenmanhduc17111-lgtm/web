const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

db.serialize(() => {
    // Kiểm tra xem cột user_id đã tồn tại chưa
    db.get("PRAGMA table_info(products)", (err, rows) => {
        if (err) {
            console.error('Lỗi kiểm tra:', err.message);
            db.close();
            return;
        }
        // rows là mảng các cột, mỗi item có cột 'name'
        // Dùng callback không phải all? Thực tế PRAGMA trả về nhiều dòng, dùng all
    });
});

// Dùng all thay vì get
db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err) {
        console.error('Lỗi:', err.message);
        db.close();
        return;
    }
    const hasUserId = columns.some(col => col.name === 'user_id');
    if (!hasUserId) {
        console.log('Đang thêm cột user_id...');
        db.run("ALTER TABLE products ADD COLUMN user_id INTEGER", (err) => {
            if (err) {
                console.error('Lỗi thêm cột:', err.message);
            } else {
                console.log('✅ Đã thêm cột user_id vào bảng products');
            }
            db.close();
        });
    } else {
        console.log('Cột user_id đã tồn tại');
        db.close();
    }
});