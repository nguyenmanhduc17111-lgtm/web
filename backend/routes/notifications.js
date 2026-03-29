const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

// Lấy danh sách thông báo của user
router.get('/', authenticate, (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    db.all(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset],
        (err, rows) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi server' });
            db.get(`SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0`, [userId], (err, count) => {
                res.json({ success: true, notifications: rows, unreadCount: count?.unread || 0 });
            });
        }
    );
});

// Đánh dấu đã đọc một thông báo
router.put('/:id/read', authenticate, (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    db.run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, userId], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server' });
        res.json({ success: true });
    });
});

// Đánh dấu tất cả đã đọc
router.put('/read-all', authenticate, (req, res) => {
    const userId = req.user.id;
    db.run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server' });
        res.json({ success: true });
    });
});

// Hàm tạo thông báo (dùng chung)
function createNotification(userId, type, title, message, data = null) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)`,
            [userId, type, title, message, data ? JSON.stringify(data) : null],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

module.exports = { router, createNotification };