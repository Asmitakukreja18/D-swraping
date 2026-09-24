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
        ['Royal Velvet Golden Hamper', 'Luxury Hampers', 2899, 'assets/wa-product-1.jpg', 'Opulent trunk hamper filled with premium chocolates, dry fruits, and handcrafted keepsakes.'],
        ['Blush Satin Floral Gift Box', 'Bouquets', 1999, 'assets/wa-product-2.jpg', 'Delicate blush pink box styled with fresh pastel roses and custom ribbon ties.'],
        ['Vintage Wooden Artisan Tray', 'Personalized Gifts', 2499, 'assets/wa-product-3.jpg', 'Rustic wooden tray arrangement featuring personalized name tag and luxury treats.'],
        ['Pastel Net & Pearl Wrap Hamper', 'Custom Wrapping', 1699, 'assets/wa-product-4.jpg', 'Elegant tulle & net overlay finished with handcrafted pearl embellishments.'],
        ['Chocoberry Luxe Balloon Basket', 'Balloon Gifts', 1899, 'assets/wa-product-5.jpg', 'Bubble balloon hamper paired with imported chocolates and fresh flower buds.'],
        ['Grand Imperial Festive Hamper', 'Festive Hampers', 3299, 'assets/wa-product-6.jpg', 'Festive curation with brass diyas, premium dry fruits, and artisanal sweets.'],
        ['Executive Corporate Crate', 'Corporate', 2199, 'assets/wa-product-7.jpg', 'Sleek executive gift set for clients, conferences, and corporate celebrations.'],
        ['Serene Lavender Spa Hamper', 'Self-Care', 1799, 'assets/wa-product-8.jpg', 'Calming self-care spa box with botanical candle, bath salts, and essential oils.'],
        ['Golden Ribbon Chocolate Box', 'Chocolates', 1499, 'assets/wa-product-9.jpg', 'Handcrafted luxury chocolate selection wrapped with gold foil accents.'],
        ['Pearl & Bow Trousseau Trunk', 'Wedding & Trousseau', 3499, 'assets/wa-product-10.jpg', 'Bridal trousseau hamper elegantly draped in pearl chains and ivory silk bows.'],
        ['Baby Shower Keepsake Basket', 'Baby & Kids', 2299, 'assets/wa-product-11.jpg', 'Adorable pastel baby hamper filled with custom plush items, socks, and treats.']
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
