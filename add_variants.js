const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

const variants = [
    [1, 'Đen', 'S', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Đen', 'M', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Đen', 'L', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Trắng', 'S', 199000, 30, 'https://picsum.photos/id/11/500/500'],
    [1, 'Trắng', 'M', 199000, 30, 'https://picsum.photos/id/11/500/500'],
    [1, 'Trắng', 'L', 199000, 30, 'https://picsum.photos/id/11/500/500'],
    [1, 'Xanh', 'S', 199000, 20, 'https://picsum.photos/id/12/500/500'],
    [1, 'Xanh', 'M', 199000, 20, 'https://picsum.photos/id/12/500/500'],
    [1, 'Xanh', 'L', 199000, 20, 'https://picsum.photos/id/12/500/500'],
];

const stmt = db.prepare('INSERT INTO product_variants (product_id, color, size, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)');
variants.forEach(v => {
    stmt.run(v, (err) => {
        if (err) console.error('Lỗi:', err.message);
        else console.log(`✅ Đã thêm variant: ${v[1]} ${v[2]} cho sản phẩm ${v[0]}`);
    });
});
stmt.finalize();

setTimeout(() => {
    db.close();
    console.log('🎉 Hoàn thành thêm variants!');
}, 1000);