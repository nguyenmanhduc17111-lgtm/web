const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'hangcamshop_secret_2024';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập!' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
        req.user = decoded;
        next();
    });
}

router.get('/', authMiddleware, (req, res) => {
    const sql = `
        SELECT c.id, c.quantity, c.product_id,
               p.name, p.price, p.image, p.stock
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });

        const cart = rows.map(item => ({
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
            stock: item.stock
        }));

        res.json({ success: true, cart });
    });
});

router.post('/add', authMiddleware, (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId], (err, product) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại!' });
        if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Sản phẩm không đủ hàng!' });

        db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existing) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });

            if (existing) {
                db.run(
                    'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                    [quantity, userId, productId],
                    (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    }
                );
            } else {
                db.run(
                    'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                    [userId, productId, quantity],
                    (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi thêm!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    }
                );
            }
        });
    });
});

router.put('/update', authMiddleware, (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
        db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm!' });
        });
    } else {
        db.run(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, userId, productId],
            (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                res.json({ success: true, message: 'Đã cập nhật!' });
            }
        );
    }
});

router.delete('/remove/:productId', authMiddleware, (req, res) => {
    db.run(
        'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
        [req.user.id, req.params.productId],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm!' });
        }
    );
});

router.delete('/clear', authMiddleware, (req, res) => {
    db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
        res.json({ success: true, message: 'Đã xóa giỏ hàng!' });
    });
});

module.exports = router;
