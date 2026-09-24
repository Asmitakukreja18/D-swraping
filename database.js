const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'dswrapping.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // 1. Products Table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_inr INTEGER NOT NULL,
      img TEXT NOT NULL,
      description TEXT
    )
  `);

  // 2. Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Orders Table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      total_inr INTEGER NOT NULL,
      currency TEXT DEFAULT 'INR',
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Paid (Demo)',
      order_status TEXT DEFAULT 'Processing',
      items_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Enquiries Table
  db.run(`
    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      occasion TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed Products if empty
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (!err && row.count === 0) {
      console.log('Seeding initial products catalogue into database...');
      const initialProducts = [
        ['The Royal Velvet Luxe Hamper', 'Luxury Hampers', 2499, 'assets/gallery-3.jpeg', 'Opulent velvet box with gourmet artisanal treats, fragrant soy candle & luxury chocolates.'],
        ['Blush Romance Bouquet', 'Bouquets', 1799, 'assets/gallery-9.jpeg', 'Exquisite arrangement of fresh roses paired with imported Ferrero Rocher & custom note card.'],
        ['Personalized Keepsake Tray', 'Personalized Gifts', 1499, 'assets/gallery-2.jpeg', 'Handcrafted wooden tray with customized name typography, gifts & frame.'],
        ['Serene Self-Care Spa Box', 'Self-Care', 1299, 'assets/gallery-4.jpeg', 'Relaxing spa hamper with scented soy candle, bath salts & lavender body oil.'],
        ['Grand Celebration Hamper', 'Festive Hampers', 2999, 'assets/gallery-10.jpeg', 'Festive basket styled with golden bells, dry fruits & handcrafted brass lamps.'],
        ['Chocoberry Balloon Gift', 'Balloon Gifts', 1599, 'assets/gallery-5.jpeg', 'Bubble balloon hamper filled with gourmet chocolates and mini roses.'],
        ['Signature Corporate Crate', 'Corporate', 3499, 'assets/gallery-8.jpeg', 'Premium leatherette crate with luxury notebook, custom mug & treats.'],
        ['Golden Ribbon Chocolate Trunk', 'Chocolates', 1899, 'assets/gallery-6.jpeg', 'Vintage wooden trunk filled with artisanal chocolates and satin ribbon.']
      ];

      const stmt = db.prepare('INSERT INTO products (name, category, price_inr, img, description) VALUES (?, ?, ?, ?, ?)');
      initialProducts.forEach(prod => stmt.run(prod));
      stmt.finalize();
    }
  });

  // Seed Admin User if not exists
  db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@dswrapping.com'], (err, row) => {
    if (!err && row.count === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run('INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', [
        'D Studio Admin',
        'admin@dswrapping.com',
        '',
        hash,
        'admin'
      ]);
    }
  });
});

module.exports = db;
