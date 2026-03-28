const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate, requireSeller } = require('../middleware/auth');

// Lấy thông tin cửa hàng theo user_id
router.get('/user/:userId', (req, res) => {
    const userId = req.params.userId;
    db.get('SELECT * FROM stores WHERE user_id = ?', [userId], (err, store) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!store) return res.status(404).json({ success: false, message: 'Cửa hàng chưa được tạo' });
        res.json({ success: true, store });
    });
});

// Tạo hoặc cập nhật thông tin cửa hàng (chỉ seller)
router.put('/', authenticate, requireSeller, (req, res) => {
    const userId = req.user.id;
    const { store_name, store_description, store_logo, store_banner } = req.body;
    console.log('Saving store for user', userId, req.body); 

    db.get('SELECT * FROM stores WHERE user_id = ?', [userId], (err, store) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (store) {
            // Cập nhật
            db.run(`UPDATE stores SET store_name=?, store_description=?, store_logo=?, store_banner=? WHERE user_id=?`,
                [store_name, store_description, store_logo, store_banner, userId], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật!' });
                    res.json({ success: true, message: 'Cập nhật cửa hàng thành công' });
                });
        } else {
            // Tạo mới
            db.run(`INSERT INTO stores (user_id, store_name, store_description, store_logo, store_banner) VALUES (?, ?, ?, ?, ?)`,
                [userId, store_name, store_description, store_logo, store_banner], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi tạo cửa hàng!' });
                    res.json({ success: true, message: 'Tạo cửa hàng thành công' });
                });
        }
    });
});

module.exports = router;