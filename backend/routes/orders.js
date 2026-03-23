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

router.post('/create', authMiddleware, (req, res) => {
    const { fullName, email, phone, address, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!fullName || !email || !phone || !address || !paymentMethod) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ!' });
    }

    const cartSQL = `
        SELECT c.quantity, c.product_id, p.name, p.price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;

    db.all(cartSQL, [userId], (err, cartItems) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Giỏ hàng trống!' });
        }

        let subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 30000;
        const totalAmount = subtotal + shippingFee;

        db.run(
            `INSERT INTO orders (user_id, full_name, email, phone, address, payment_method, total_amount, shipping_fee)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, fullName, email, phone, address, paymentMethod, totalAmount, shippingFee],
            function(err) {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi tạo đơn!' });

                const orderId = this.lastID;
                const stmt = db.prepare(
                    'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)'
                );
                cartItems.forEach(item => {
                    stmt.run([orderId, item.product_id, item.name, item.quantity, item.price]);
                    db.run('UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
                        [item.quantity, item.quantity, item.product_id]);
                });
                stmt.finalize();

                db.run('DELETE FROM cart WHERE user_id = ?', [userId]);

                res.status(201).json({
                    success: true,
                    message: 'Đặt hàng thành công!',
                    orderId,
                    totalAmount
                });
            }
        );
    });
});

router.get('/history', authMiddleware, (req, res) => {
    db.all(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, orders) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
            res.json({ success: true, orders });
        }
    );
});

module.exports = router;
