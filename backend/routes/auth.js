const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'hangcamshop_secret_2024';
const SALT_ROUNDS = 10;

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin!' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
    }

    db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (row) return res.status(400).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại!' });

        bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
            if (err) return res.status(500).json({ success: false, message: 'Lỗi khi mã hóa mật khẩu!' });

            db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword],
                function(err) {
                    if (err) return res.status(500).json({ success: false, message: 'Lỗi khi tạo tài khoản!' });
                    res.status(201).json({ success: true, message: 'Đăng ký thành công! Vui lòng đăng nhập.' });
                }
            );
        });
    });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin!' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Lỗi server!' });
        if (!user) return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng!' });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Đăng nhập thành công!',
                token,
                user: { id: user.id, username: user.username, email: user.email, role: user.role }
            });
        });
    });
});

router.get('/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Token không hợp lệ!' });

        db.get('SELECT id, username, email, role FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
            res.json({ success: true, user });
        });
    });
});

module.exports = router;
