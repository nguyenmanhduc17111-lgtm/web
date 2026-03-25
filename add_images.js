const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'shopdb.sqlite'));

// Xóa dữ liệu cũ (nếu muốn reset, bỏ comment dòng dưới)
// db.run('DELETE FROM product_images');

// Mảng ảnh mẫu cho từng sản phẩm
const images = [
    // Product ID 1: Áo thun nam
    [1, 'https://picsum.photos/id/10/500/500', 0],
    [1, 'https://picsum.photos/id/11/500/500', 1],
    [1, 'https://picsum.photos/id/12/500/500', 2],
    // Product ID 2: Quần jean nữ
    [2, 'https://picsum.photos/id/20/500/500', 0],
    [2, 'https://picsum.photos/id/21/500/500', 1],
    [2, 'https://picsum.photos/id/22/500/500', 2],
    // Product ID 3: Váy đầm dự tiệc
    [3, 'https://picsum.photos/id/30/500/500', 0],
    [3, 'https://picsum.photos/id/31/500/500', 1],
    [3, 'https://picsum.photos/id/32/500/500', 2],
    // Product ID 4: Điện thoại thông minh
    [4, 'https://picsum.photos/id/40/500/500', 0],
    [4, 'https://picsum.photos/id/41/500/500', 1],
    [4, 'https://picsum.photos/id/42/500/500', 2],
    // Product ID 5: Laptop cao cấp
    [5, 'https://picsum.photos/id/50/500/500', 0],
    [5, 'https://picsum.photos/id/51/500/500', 1],
    [5, 'https://picsum.photos/id/52/500/500', 2],
    // Product ID 6: Tai nghe không dây
    [6, 'https://picsum.photos/id/60/500/500', 0],
    [6, 'https://picsum.photos/id/61/500/500', 1],
    [6, 'https://picsum.photos/id/62/500/500', 2],
    // Product ID 7: Nồi chiên không dầu
    [7, 'https://picsum.photos/id/70/500/500', 0],
    [7, 'https://picsum.photos/id/71/500/500', 1],
    [7, 'https://picsum.photos/id/72/500/500', 2],
    // Product ID 8: Máy xay sinh tố
    [8, 'https://picsum.photos/id/80/500/500', 0],
    [8, 'https://picsum.photos/id/81/500/500', 1],
    [8, 'https://picsum.photos/id/82/500/500', 2],
    // Product ID 9: Bộ dao nhà bếp
    [9, 'https://picsum.photos/id/90/500/500', 0],
    [9, 'https://picsum.photos/id/91/500/500', 1],
    [9, 'https://picsum.photos/id/92/500/500', 2],
    // Product ID 10: Sách dạy nấu ăn
    [10, 'https://picsum.photos/id/100/500/500', 0],
    [10, 'https://picsum.photos/id/101/500/500', 1],
    [10, 'https://picsum.photos/id/102/500/500', 2],
    // Product ID 11: Giày thể thao nam
    [11, 'https://picsum.photos/id/110/500/500', 0],
    [11, 'https://picsum.photos/id/111/500/500', 1],
    [11, 'https://picsum.photos/id/112/500/500', 2],
    // Product ID 12: Son môi cao cấp
    [12, 'https://picsum.photos/id/120/500/500', 0],
    [12, 'https://picsum.photos/id/121/500/500', 1],
    [12, 'https://picsum.photos/id/122/500/500', 2],
    // Product ID 13: Dầu ăn thực vật 2L
    [13, 'https://picsum.photos/id/130/500/500', 0],
    [13, 'https://picsum.photos/id/131/500/500', 1],
    [13, 'https://picsum.photos/id/132/500/500', 2],
];

const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');

images.forEach(img => {
    stmt.run(img, (err) => {
        if (err) console.error(`❌ Lỗi thêm ảnh cho product ${img[0]}:`, err.message);
        else console.log(`✅ Đã thêm ảnh cho sản phẩm ID ${img[0]}`);
    });
});

stmt.finalize();

setTimeout(() => {
    db.close();
    console.log('🎉 Hoàn thành thêm ảnh phụ cho tất cả sản phẩm!');
}, 1000);