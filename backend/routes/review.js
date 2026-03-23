const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/product/:productId', (req, res) => {
    const productId = req.params.productId;
    db.all(
        `SELECT id, user_name, rating, comment, created_at 
         FROM reviews 
         WHERE product_id = ? 
         ORDER BY created_at DESC`,
        [productId],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
            db.get(
                'SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE product_id = ?',
                [productId],
                (err, stats) => {
                    res.json({
                        success: true,
                        reviews: rows,
                        stats: {
                            average_rating: stats?.avg_rating || 0,
                            total_reviews: stats?.total || 0
                        }
                    });
                }
            );
        }
    );
});

router.post('/add', (req, res) => {
    const { product_id, user_id, user_name, rating, comment } = req.body;
    if (!product_id || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ!' });
    }
    db.run(
        `INSERT INTO reviews (product_id, user_id, user_name, rating, comment) 
         VALUES (?, ?, ?, ?, ?)`,
        [product_id, user_id, user_name, rating, comment],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi khi thêm đánh giá!' });
            res.json({ success: true, message: 'Đã thêm đánh giá!', id: this.lastID });
        }
    );
});

module.exports = router;