const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireSeller } = require('../middleware/auth');



router.get('/', (req, res) => {
    const { category, search } = req.query;
    let sql = 'SELECT * FROM products WHERE is_active = 1';
    const params = [];
    if (category && category !== 'all') {
        sql += ' AND category = ?';
        params.push(category);
    }
    if (search) {
        sql += ' AND name LIKE ?';
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        const products = rows.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            oldPrice: p.old_price,
            image: p.image,
            category: p.category,
            rating: p.rating,
            sold: p.sold,
            stock: p.stock,
            tag: p.tag
        }));
        res.json({ success: true, products });
    });
});

router.get('/:id', (req, res) => {
    const productId = req.params.id;
    db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId], (err, product) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm!' });

        // Lấy ảnh phụ
        db.all('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order', [productId], (err, images) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi khi lấy ảnh!' });
            product.images = images.map(img => img.image_url);

            // Lấy biến thể
            db.all('SELECT * FROM product_variants WHERE product_id = ? ORDER BY color, size', [productId], (err, variants) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi khi lấy biến thể!' });
                product.variants = variants;
                res.json({ success: true, product });
            });
        });
    });
});

router.post('/', authenticate, requireSeller, (req, res) => {
    const { name, price, old_price, image, category, description, stock, tag, images = [], variants = [] } = req.body;
    const userId = req.user.id;

    db.run(
        `INSERT INTO products (user_id, name, price, old_price, image, category, description, stock, tag)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, price, old_price, image, category, description, stock, tag],
        function(err) {
            if (err) {
                console.error('❌ Lỗi thêm sản phẩm:', err.message);
                return res.status(500).json({ success: false, message: 'Lỗi thêm sản phẩm: ' + err.message });
            }
            const productId = this.lastID;

            // Thêm ảnh phụ
            if (images.length > 0) {
                const stmt = db.prepare('INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)');
                images.forEach((url, idx) => {
                    stmt.run([productId, url, idx], (err) => {
                        if (err) console.error('Lỗi thêm ảnh phụ:', err);
                    });
                });
                stmt.finalize();
            }

            // Thêm biến thể (màu, size)
            if (variants.length > 0) {
                const stmt = db.prepare(`INSERT INTO product_variants (product_id, color, size, price, stock, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
                variants.forEach(v => {
                    stmt.run([productId, v.color, v.size, v.price, v.stock, v.image_url || null], (err) => {
                        if (err) console.error('Lỗi thêm biến thể:', err);
                    });
                });
                stmt.finalize();
            }

            res.json({ success: true, message: 'Đã thêm sản phẩm', productId });
        }
    );
});

router.put('/:id', authenticate, requireSeller, (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;
    // Kiểm tra sản phẩm thuộc về seller
    db.get('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId], (err, product) => {
        if (err || !product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm hoặc không có quyền!' });
        // Thực hiện cập nhật
        db.run(`UPDATE products SET name=?, price=?, old_price=?, image=?, category=?, description=?, stock=?, tag=? WHERE id=?`,
            [updates.name, updates.price, updates.old_price, updates.image, updates.category, updates.description, updates.stock, updates.tag, productId],
            (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                res.json({ success: true, message: 'Cập nhật thành công' });
            }
        );
    });
});


router.delete('/:id', authenticate, requireSeller, (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    db.get('SELECT * FROM products WHERE id = ? AND user_id = ?', [productId, userId], (err, product) => {
        if (err || !product) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm hoặc không có quyền!' });
        db.run('DELETE FROM products WHERE id = ?', [productId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm' });
        });
    });
});


// Lấy sản phẩm của một seller cụ thể
router.get('/seller/:sellerId', (req, res) => {
    const sellerId = req.params.sellerId;
    db.all('SELECT * FROM products WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC', [sellerId], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        res.json({ success: true, products: rows });
    });
});

module.exports = router;