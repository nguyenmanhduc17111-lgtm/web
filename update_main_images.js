const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopdb.sqlite');

const updates = [
  [1,  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'],
  [2,  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300'],
  [3,  'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg'],
  [4,  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300'],
  [5,  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300'],
  [6,  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'],
  [7,  'https://images.unsplash.com/photo-1604908176997-4310d6c03a9f?w=300'],
  [8,  'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=300'],
  [9,  'https://images.unsplash.com/photo-1566454825481-9c7d1c0f3a0c?w=300'],
  [10, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300'],
  [11, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'],
  [12, 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300'],
  [13, 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg'], 
];

const stmt = db.prepare('UPDATE products SET image = ? WHERE id = ?');
updates.forEach(([id, url]) => {
    stmt.run(url, id, (err) => {
        if (err) console.error(`Lỗi cập nhật ID ${id}:`, err.message);
        else console.log(`✅ Đã cập nhật ảnh cho sản phẩm ID ${id}`);
    });
});
stmt.finalize();
setTimeout(() => {
    db.close();
    console.log('Hoàn thành!');
}, 1000);