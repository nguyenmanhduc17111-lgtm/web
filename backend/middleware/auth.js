const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'hangcamshop_secret_2024';

// Xác thực token, gắn user vào req.user
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Chưa đăng nhập!' });
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Token không hợp lệ!' });
        req.user = decoded;
        next();
    });
};

// Kiểm tra role seller
const requireSeller = (req, res, next) => {
    if (!req.user || req.user.role !== 'seller') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện hành động này!' });
    }
    next();
};

module.exports = { authenticate, requireSeller };