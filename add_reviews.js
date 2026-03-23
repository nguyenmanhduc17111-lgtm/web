const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

const reviews = [
    [1, 1, 'Nguyễn Văn A', 5, 'Rất đẹp, chất lượng tốt!'],
    [1, 2, 'Trần Thị B', 4, 'Hàng ok, giao hàng nhanh.'],
    [1, 3, 'Lê Văn C', 5, 'Ổn, sẽ ủng hộ tiếp.'],
];

const stmt = db.prepare('INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)');
reviews.forEach(r => {
    stmt.run(r, (err) => {
        if (err) console.error('Lỗi:', err.message);
        else console.log(`✅ Đã thêm review cho sản phẩm ${r[0]}`);
    });
});
stmt.finalize();

setTimeout(() => {
    db.close();
    console.log('🎉 Hoàn thành thêm reviews!');
}, 1000);