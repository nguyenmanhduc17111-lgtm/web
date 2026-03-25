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

// Lấy giỏ hàng (kèm thông tin biến thể)
router.get('/', authMiddleware, (req, res) => {
    const sql = `
        SELECT c.id, c.quantity, c.product_id, c.variant_id,
               p.name as product_name, p.price as product_price, p.image as product_image,
               pv.color, pv.size, pv.price as variant_price
        FROM cart c
        JOIN products p ON c.product_id = p.id
        LEFT JOIN product_variants pv ON c.variant_id = pv.id
        WHERE c.user_id = ?
    `;

    db.all(sql, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });

        const cart = rows.map(item => ({
            id: item.product_id,
            name: item.product_name,
            price: item.variant_price || item.product_price,
            image: item.product_image,
            quantity: item.quantity,
            variant: item.variant_id ? { id: item.variant_id, color: item.color, size: item.size } : null
        }));

        res.json({ success: true, cart });
    });
});

// Thêm vào giỏ hàng (có variantId)
router.post('/add', authMiddleware, (req, res) => {
    const { productId, variantId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Nếu có variantId
    if (variantId) {
        db.get('SELECT * FROM product_variants WHERE id = ? AND product_id = ?', [variantId, productId], (err, variant) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
            if (!variant) return res.status(404).json({ success: false, message: 'Biến thể không tồn tại!' });
            if (variant.stock < quantity) return res.status(400).json({ success: false, message: 'Biến thể này đã hết hàng!' });

            db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?', [userId, productId, variantId], (err, existing) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
                if (existing) {
                    db.run('UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND variant_id = ?', [quantity, userId, productId, variantId], (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    });
                } else {
                    db.run('INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)', [userId, productId, variantId, quantity], (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi thêm!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    });
                }
            });
        });
    } else {
        // Không có biến thể
        db.get('SELECT * FROM products WHERE id = ? AND is_active = 1', [productId], (err, product) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
            if (!product) return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại!' });
            if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Sản phẩm không đủ hàng!' });

            db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND variant_id IS NULL', [userId, productId], (err, existing) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
                if (existing) {
                    db.run('UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ? AND variant_id IS NULL', [quantity, userId, productId], (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    });
                } else {
                    db.run('INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)', [userId, productId, null, quantity], (err) => {
                        if (err) return res.status(500).json({ success: false, message: 'Lỗi thêm!' });
                        res.json({ success: true, message: 'Đã thêm vào giỏ hàng!' });
                    });
                }
            });
        });
    }
});

// Cập nhật số lượng (hỗ trợ variantId)
router.put('/update', authMiddleware, (req, res) => {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
        const where = variantId ? 'user_id = ? AND product_id = ? AND variant_id = ?' : 'user_id = ? AND product_id = ? AND variant_id IS NULL';
        const params = variantId ? [userId, productId, variantId] : [userId, productId];
        db.run(`DELETE FROM cart WHERE ${where}`, params, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm!' });
        });
    } else {
        const where = variantId ? 'user_id = ? AND product_id = ? AND variant_id = ?' : 'user_id = ? AND product_id = ? AND variant_id IS NULL';
        const params = variantId ? [quantity, userId, productId, variantId] : [quantity, userId, productId];
        db.run(`UPDATE cart SET quantity = ? WHERE ${where}`, params, (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
            res.json({ success: true, message: 'Đã cập nhật!' });
        });
    }
});

// Xóa một sản phẩm (hỗ trợ variantId)
router.delete('/remove/:productId', authMiddleware, (req, res) => {
    const variantId = req.query.variantId;
    const userId = req.user.id;
    const productId = req.params.productId;

    if (variantId) {
        db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ? AND variant_id = ?', [userId, productId, variantId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm!' });
        });
    } else {
        db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ? AND variant_id IS NULL', [userId, productId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
            res.json({ success: true, message: 'Đã xóa sản phẩm!' });
        });
    }
});

router.delete('/clear', authMiddleware, (req, res) => {
    db.run('DELETE FROM cart WHERE user_id = ?', [req.user.id], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi xóa!' });
        res.json({ success: true, message: 'Đã xóa giỏ hàng!' });
    });
});

module.exports = router;