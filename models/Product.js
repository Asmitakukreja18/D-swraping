const db = require('../config/db');

const Product = {
  getAll: (callback) => {
    db.all('SELECT * FROM products ORDER BY id DESC', [], callback);
  },

  getById: (id, callback) => {
    db.get('SELECT * FROM products WHERE id = ?', [id], callback);
  },

  create: (data, callback) => {
    const { name, category, price_inr, img, description } = data;
    db.run(
      'INSERT INTO products (name, category, price_inr, img, description) VALUES (?, ?, ?, ?, ?)',
      [name, category, price_inr, img, description || ''],
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  },

  update: (id, data, callback) => {
    const { name, category, price_inr, img, description } = data;
    db.run(
      'UPDATE products SET name = ?, category = ?, price_inr = ?, img = ?, description = ? WHERE id = ?',
      [name, category, price_inr, img, description || '', id],
      callback
    );
  },

  delete: (id, callback) => {
    db.run('DELETE FROM products WHERE id = ?', [id], callback);
  }
};

module.exports = Product;
