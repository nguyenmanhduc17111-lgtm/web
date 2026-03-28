const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./models/initDB');
const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const cartRoutes     = require('./routes/giohang');
const orderRoutes    = require('./routes/orders');
const reviewRoutes = require('./routes/review'); // nếu tên file là review.js
const app = express();
const PORT = process.env.PORT || 5000;
const storeRoutes = require('./routes/store');



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Phục vụ file tĩnh từ thư mục 'public' (đặt trước các route)
app.use(express.static(path.join(__dirname, '../frontend')));

initializeDatabase();

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stores', storeRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: '🚀 HangCamShop Server đang chạy!', time: new Date() });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🛍️  HangCamShop Server Started      ║');
    console.log(`║   📡 Server: http://localhost:${PORT}      ║`);
    console.log('║   📦 Database: SQLite (shopdb.sqlite)   ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
});