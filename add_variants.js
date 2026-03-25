const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'shopdb.sqlite'));

// Xóa dữ liệu cũ (nếu muốn reset, bỏ comment dòng dưới)
// db.run('DELETE FROM product_variants');

const variants = [
    // 1. Áo thun nam – màu + size (S, M, L)
    [1, 'Đen', 'S', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Đen', 'M', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Đen', 'L', 199000, 50, 'https://picsum.photos/id/10/500/500'],
    [1, 'Trắng', 'S', 199000, 40, 'https://picsum.photos/id/11/500/500'],
    [1, 'Trắng', 'M', 199000, 40, 'https://picsum.photos/id/11/500/500'],
    [1, 'Trắng', 'L', 199000, 40, 'https://picsum.photos/id/11/500/500'],
    [1, 'Xanh', 'S', 199000, 30, 'https://picsum.photos/id/12/500/500'],
    [1, 'Xanh', 'M', 199000, 30, 'https://picsum.photos/id/12/500/500'],
    [1, 'Xanh', 'L', 199000, 30, 'https://picsum.photos/id/12/500/500'],

    // 2. Quần jean nữ – size (S, M, L, XL) + 2 màu
    [2, 'Xanh đậm', 'S', 349000, 30, 'https://picsum.photos/id/20/500/500'],
    [2, 'Xanh đậm', 'M', 349000, 40, 'https://picsum.photos/id/20/500/500'],
    [2, 'Xanh đậm', 'L', 349000, 35, 'https://picsum.photos/id/20/500/500'],
    [2, 'Xanh đậm', 'XL', 349000, 20, 'https://picsum.photos/id/20/500/500'],
    [2, 'Đen', 'S', 349000, 25, 'https://picsum.photos/id/21/500/500'],
    [2, 'Đen', 'M', 349000, 35, 'https://picsum.photos/id/21/500/500'],
    [2, 'Đen', 'L', 349000, 30, 'https://picsum.photos/id/21/500/500'],
    [2, 'Đen', 'XL', 349000, 15, 'https://picsum.photos/id/21/500/500'],

    // 3. Váy đầm dự tiệc – size (S, M, L) + 3 màu
    [3, 'Đỏ', 'S', 599000, 15, 'https://picsum.photos/id/30/500/500'],
    [3, 'Đỏ', 'M', 599000, 20, 'https://picsum.photos/id/30/500/500'],
    [3, 'Đỏ', 'L', 599000, 10, 'https://picsum.photos/id/30/500/500'],
    [3, 'Hồng', 'S', 599000, 12, 'https://picsum.photos/id/31/500/500'],
    [3, 'Hồng', 'M', 599000, 18, 'https://picsum.photos/id/31/500/500'],
    [3, 'Hồng', 'L', 599000, 8, 'https://picsum.photos/id/31/500/500'],
    [3, 'Xanh dương', 'S', 599000, 10, 'https://picsum.photos/id/32/500/500'],
    [3, 'Xanh dương', 'M', 599000, 15, 'https://picsum.photos/id/32/500/500'],
    [3, 'Xanh dương', 'L', 599000, 5, 'https://picsum.photos/id/32/500/500'],

    // 4. Điện thoại thông minh – màu (Đen, Bạc, Vàng)
    [4, 'Đen', null, 7990000, 100, 'https://picsum.photos/id/40/500/500'],
    [4, 'Bạc', null, 7990000, 80, 'https://picsum.photos/id/41/500/500'],
    [4, 'Vàng', null, 7990000, 50, 'https://picsum.photos/id/42/500/500'],

    // 5. Laptop cao cấp – màu (Xám, Bạc)
    [5, 'Xám', null, 15990000, 30, 'https://picsum.photos/id/50/500/500'],
    [5, 'Bạc', null, 15990000, 25, 'https://picsum.photos/id/51/500/500'],

    // 6. Tai nghe không dây – màu (Đen, Trắng, Xanh)
    [6, 'Đen', null, 1290000, 200, 'https://picsum.photos/id/60/500/500'],
    [6, 'Trắng', null, 1290000, 150, 'https://picsum.photos/id/61/500/500'],
    [6, 'Xanh', null, 1290000, 100, 'https://picsum.photos/id/62/500/500'],

    // 7. Nồi chiên không dầu – dung tích (2.5L, 3.5L, 4.5L)
    [7, 'Đen', '2.5L', 1590000, 50, 'https://picsum.photos/id/70/500/500'],
    [7, 'Đen', '3.5L', 1890000, 40, 'https://picsum.photos/id/70/500/500'],
    [7, 'Đen', '4.5L', 2190000, 30, 'https://picsum.photos/id/70/500/500'],

    // 8. Máy xay sinh tố – dung tích (1L, 1.5L)
    [8, 'Trắng', '1L', 890000, 60, 'https://picsum.photos/id/80/500/500'],
    [8, 'Trắng', '1.5L', 1090000, 40, 'https://picsum.photos/id/80/500/500'],
    [8, 'Đen', '1L', 890000, 50, 'https://picsum.photos/id/81/500/500'],
    [8, 'Đen', '1.5L', 1090000, 30, 'https://picsum.photos/id/81/500/500'],

    // 9. Bộ dao nhà bếp – không có biến thể (để trống hoặc thêm tay cầm màu)
    // 10. Sách dạy nấu ăn – không biến thể

    // 11. Giày thể thao nam – size (39-43) + 2 màu
    [11, 'Đen', '39', 850000, 20, 'https://picsum.photos/id/110/500/500'],
    [11, 'Đen', '40', 850000, 25, 'https://picsum.photos/id/110/500/500'],
    [11, 'Đen', '41', 850000, 30, 'https://picsum.photos/id/110/500/500'],
    [11, 'Đen', '42', 850000, 25, 'https://picsum.photos/id/110/500/500'],
    [11, 'Đen', '43', 850000, 15, 'https://picsum.photos/id/110/500/500'],
    [11, 'Trắng', '39', 850000, 18, 'https://picsum.photos/id/111/500/500'],
    [11, 'Trắng', '40', 850000, 22, 'https://picsum.photos/id/111/500/500'],
    [11, 'Trắng', '41', 850000, 28, 'https://picsum.photos/id/111/500/500'],
    [11, 'Trắng', '42', 850000, 20, 'https://picsum.photos/id/111/500/500'],
    [11, 'Trắng', '43', 850000, 12, 'https://picsum.photos/id/111/500/500'],

    // 12. Son môi cao cấp – màu (Đỏ, Hồng, Cam)
    [12, 'Đỏ', null, 350000, 150, 'https://picsum.photos/id/120/500/500'],
    [12, 'Hồng', null, 350000, 120, 'https://picsum.photos/id/121/500/500'],
    [12, 'Cam', null, 350000, 100, 'https://picsum.photos/id/122/500/500'],

    // 13. Dầu ăn thực vật 2L – không biến thể (có thể thêm loại)
];

const stmt = db.prepare('INSERT INTO product_variants (product_id, color, size, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)');

variants.forEach(v => {
    stmt.run(v, (err) => {
        if (err) console.error(`❌ Lỗi thêm variant cho product ${v[0]}:`, err.message);
        else console.log(`✅ Đã thêm variant: ${v[1]} ${v[2] || ''} cho sản phẩm ID ${v[0]}`);
    });
});

stmt.finalize();

setTimeout(() => {
    db.close();
    console.log('🎉 Hoàn thành thêm biến thể cho tất cả sản phẩm!');
}, 1000);