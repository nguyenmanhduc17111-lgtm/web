const db = require('../database/db');

function initializeDatabase() {
    db.serialize(() => {
        // Bảng users
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'customer',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng users:', err.message);
            else console.log('✅ Bảng users đã sẵn sàng');
        });

        // Bảng products (thêm cột user_id)
        db.run(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT NOT NULL,
                price INTEGER NOT NULL,
                old_price INTEGER,
                image TEXT DEFAULT 'https://via.placeholder.com/300x300',
                category TEXT NOT NULL,
                rating REAL DEFAULT 5.0,
                sold INTEGER DEFAULT 0,
                stock INTEGER DEFAULT 100,
                tag TEXT,
                description TEXT,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng products:', err.message);
            else {
                console.log('✅ Bảng products đã sẵn sàng');
                seedProducts();
            }
        });

        // Bảng cart
        db.run(`
            CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng cart:', err.message);
            else console.log('✅ Bảng cart đã sẵn sàng');
        });

        // Bảng orders
        db.run(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                full_name TEXT NOT NULL,
                email TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                payment_method TEXT NOT NULL,
                total_amount INTEGER NOT NULL,
                shipping_fee INTEGER DEFAULT 30000,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng orders:', err.message);
            else console.log('✅ Bảng orders đã sẵn sàng');
        });

        // Bảng order_items
        db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                product_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price INTEGER NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng order_items:', err.message);
            else console.log('✅ Bảng order_items đã sẵn sàng');
        });

        // Bảng reviews
        db.run(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                user_name TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng reviews:', err.message);
            else console.log('✅ Bảng reviews đã sẵn sàng');
        });

        // Bảng product_images
        db.run(`
            CREATE TABLE IF NOT EXISTS product_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                display_order INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng product_images:', err.message);
            else console.log('✅ Bảng product_images đã sẵn sàng');
        });

        // Bảng stores (sửa tore_banner thành store_banner)
        db.run(`
            CREATE TABLE IF NOT EXISTS stores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                store_name TEXT NOT NULL,
                store_description TEXT,
                store_logo TEXT,
                store_banner TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng stores:', err.message);
            else console.log('✅ Bảng stores đã sẵn sàng');
        });

        // Bảng product_variants
        db.run(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                color TEXT,
                size TEXT,
                price INTEGER,
                stock INTEGER DEFAULT 0,
                sku TEXT,
                image_url TEXT,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) console.error('❌ Lỗi tạo bảng product_variants:', err.message);
            else console.log('✅ Bảng product_variants đã sẵn sàng');
        });
    });
}

function seedProducts() {
    db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
        if (err || row.count > 0) return;

        const sampleProducts = [
            ['Áo thun nam',          199000, 299000, 'https://via.placeholder.com/300x300', 'thoitrang', 4.5, 150, 'sale'],
            ['Quần jean nữ',          349000, 499000, 'https://via.placeholder.com/300x300', 'thoitrang', 4.8, 89,  'new'],
            ['Váy đầm dự tiệc',       599000, 899000, 'https://via.placeholder.com/300x300', 'thoitrang', 4.7, 45,  null],
            ['Điện thoại thông minh', 7990000,9990000,'https://via.placeholder.com/300x300', 'dientu',   4.9, 234, 'sale'],
            ['Laptop cao cấp',        15990000,18990000,'https://via.placeholder.com/300x300','dientu',  4.8, 67,  null],
            ['Tai nghe không dây',    1290000,1990000, 'https://via.placeholder.com/300x300', 'dientu',  4.6, 456, 'new'],
            ['Nồi chiên không dầu',   1590000,2490000, 'https://via.placeholder.com/300x300', 'giadung', 4.7, 123, null],
            ['Máy xay sinh tố',        890000,1290000, 'https://via.placeholder.com/300x300', 'giadung', 4.5, 89,  'sale'],
            ['Bộ dao nhà bếp',         450000, 690000, 'https://via.placeholder.com/300x300', 'giadung', 4.4, 234, null],
            ['Sách dạy nấu ăn',        180000, 250000, 'https://via.placeholder.com/300x300', 'sach',    4.6, 78,  'new'],
            ['Giày thể thao nam',      850000,1200000, 'https://via.placeholder.com/300x300', 'thethao', 4.7, 112, 'sale'],
            ['Son môi cao cấp',         350000, 500000, 'https://via.placeholder.com/300x300', 'lamdep',  4.8, 203, 'new'],
            ['Dầu ăn thực vật 2L',     120000, 150000, 'https://via.placeholder.com/300x300', 'thucpham',4.3, 567, null],
        ];

        const stmt = db.prepare(`
            INSERT INTO products (name, price, old_price, image, category, rating, sold, tag)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        sampleProducts.forEach(p => stmt.run(p));
        stmt.finalize();
        console.log('🌱 Đã thêm', sampleProducts.length, 'sản phẩm mẫu vào database');
    });
}

module.exports = { initializeDatabase };