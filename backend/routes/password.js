const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const { authenticate } = require('../middleware/auth');

const SALT_ROUNDS = 10;

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/change', authenticate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ mật khẩu!' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
    }

    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Mật khẩu cũ không đúng!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật mật khẩu!' });
            res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
        });
    });
});

// Yêu cầu đặt lại mật khẩu (gửi mã)
router.post('/forgot', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Vui lòng nhập email!' });

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại!' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        db.run('DELETE FROM password_resets WHERE user_id = ?', [user.id], () => {
            db.run('INSERT INTO password_resets (user_id, code, expires_at) VALUES (?, ?, ?)',
                [user.id, code, expiresAt.toISOString()],
                (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi tạo mã!' });
                    res.json({ success: true, message: `Mã xác nhận của bạn là: ${code}`, code });
                });
        });
    });
});

// Xác nhận mã và đặt lại mật khẩu
router.post('/reset', (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
    }

    db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!user) return res.status(404).json({ success: false, message: 'Email không tồn tại!' });

        db.get('SELECT * FROM password_resets WHERE user_id = ? AND code = ? AND expires_at > ?',
            [user.id, code, new Date().toISOString()],
            async (err, reset) => {
                if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
                if (!reset) return res.status(400).json({ success: false, message: 'Mã không hợp lệ hoặc đã hết hạn!' });

                const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
                db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id], (err) => {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi cập nhật mật khẩu!' });
                    db.run('DELETE FROM password_resets WHERE user_id = ?', [user.id]);
                    res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
                });
            });
    });
});

module.exports = router;