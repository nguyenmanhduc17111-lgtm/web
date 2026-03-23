const express = require('express');
const router = express.Router();
const db = require('../database/db');

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

module.exports = router;