const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

const images = [
    [1, 'https://picsum.photos/id/10/500/500', 0],
    [1, 'https://picsum.photos/id/11/500/500', 1],
    [1, 'https://picsum.photos/id/12/500/500', 2],
    [2, 'https://picsum.photos/id/20/500/500', 0],
    [2, 'https://picsum.photos/id/21/500/500', 1],
    [3, 'https://picsum.photos/id/30/500/500', 0],
    [3, 'https://picsum.photos/id/31/500/500', 1],
    [3, 'https://picsum.photos/id/32/500/500', 2],
];

const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');
images.forEach(img => {
    stmt.run(img, (err) => {
        if (err) console.error('Lỗi:', err.message);
        else console.log(`Đã thêm ảnh cho sản phẩm ID ${img[0]}`);
    });
});
stmt.finalize();

setTimeout(() => {
    db.close();
    console.log('✅ Hoàn thành thêm ảnh mẫu!');
}, 1000);