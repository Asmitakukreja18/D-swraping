const db = require('../config/db');

const Order = {
  getAll: (callback) => {
    db.all('SELECT * FROM orders ORDER BY id DESC', [], callback);
  },

  getByCode: (orderCode, callback) => {
    db.get('SELECT * FROM orders WHERE order_code = ?', [orderCode], callback);
  },

  getByUserId: (userId, callback) => {
    db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId], callback);
  },

  create: (orderData, callback) => {
    const {
      orderCode, userId, customerName, customerPhone,
      shippingAddress, city, state, pincode,
      totalINR, currency, paymentMethod, paymentStatus, orderStatus, itemsJSON
    } = orderData;

    db.run(
      `INSERT INTO orders (
        order_code, user_id, customer_name, customer_phone,
        shipping_address, city, state, pincode,
        total_inr, currency, payment_method, payment_status, order_status, items_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderCode, userId || null, customerName, customerPhone,
        shippingAddress, city || '', state || '', pincode || '',
        totalINR || 0, currency || 'INR', paymentMethod || 'UPI',
        paymentStatus || 'Paid (Demo)', orderStatus || 'Order Placed', itemsJSON
      ],
      function(err) {
        callback(err, this ? this.lastID : null);
      }
    );
  },

  updateStatus: (id, status, callback) => {
    db.run('UPDATE orders SET order_status = ? WHERE id = ?', [status, id], callback);
  }
};

module.exports = Order;
