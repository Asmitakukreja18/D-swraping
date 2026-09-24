const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'ds_wrapping_studio_secret_key_2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// JWT Middleware Authentication Helper
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

/* ==========================================================================
   REST API ENDPOINTS
   ========================================================================== */

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: "D's Wrapping Studio Backend API",
    time: new Date().toISOString()
  });
});

// 2. Get Products Catalog
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY id ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    res.json(rows);
  });
});

// 3. User Register
app.post('/api/auth/register', (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'Full name, email and password are required' });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [fullName, email.toLowerCase().trim(), phone || '', hash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email address is already registered' });
        }
        return res.status(500).json({ error: 'User registration failed' });
      }

      const userId = this.lastID;
      const token = jwt.sign({ id: userId, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        message: 'Account created successfully',
        token,
        user: { id: userId, fullName, email, phone, role: 'customer' }
      });
    }
  );
});

// 4. User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid email or password' });

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

// 5. Get Logged In User Profile
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

// 6. Create Pan-India Order
app.post('/api/orders', (req, res) => {
  const {
    customerName,
    customerPhone,
    shippingAddress,
    city,
    state,
    pincode,
    totalINR,
    currency,
    paymentMethod,
    items,
    userId
  } = req.body;

  if (!customerName || !customerPhone || !shippingAddress || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer info, shipping address and cart items are required' });
  }

  const orderCode = 'DS-' + Math.floor(100000 + Math.random() * 900000);
  const itemsJSON = JSON.stringify(items);

  db.run(
    `INSERT INTO orders (
      order_code, user_id, customer_name, customer_phone, shipping_address, city, state, pincode,
      total_inr, currency, payment_method, items_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderCode,
      userId || null,
      customerName,
      customerPhone,
      shippingAddress,
      city || '',
      state || '',
      pincode || '',
      totalINR || 0,
      currency || 'INR',
      paymentMethod || 'UPI',
      itemsJSON
    ],
    function(err) {
      if (err) {
        console.error('Order creation error:', err);
        return res.status(500).json({ error: 'Failed to record order in database' });
      }

      res.status(201).json({
        message: 'Order created successfully',
        orderCode,
        orderId: this.lastID,
        customerName,
        totalINR,
        estimatedDelivery: '3-5 Business Days (Pan-India)',
        paymentStatus: 'Paid (Demo)'
      });
    }
  );
});

// 7. Get Order Receipt by Order Code
app.get('/api/orders/:code', (req, res) => {
  const orderCode = req.params.code;
  db.get('SELECT * FROM orders WHERE order_code = ?', [orderCode], (err, order) => {
    if (err || !order) return res.status(404).json({ error: 'Order not found' });
    order.items = JSON.parse(order.items_json);
    res.json(order);
  });
});

// 8. Submit Contact / Custom Hamper Enquiry
app.post('/api/enquiries', (req, res) => {
  const { name, phone, occasion, message } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and Phone number are required' });

  db.run(
    'INSERT INTO enquiries (name, phone, occasion, message) VALUES (?, ?, ?, ?)',
    [name, phone, occasion || '', message || ''],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to record enquiry' });
      res.json({ message: 'Enquiry submitted successfully', enquiryId: this.lastID });
    }
  );
});

// 9. Admin API: List All Orders
app.get('/api/admin/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database query error' });
    const formatted = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items_json)
    }));
    res.json(formatted);
  });
});

// 10. Admin API: Update Delivery Status
app.patch('/api/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  db.run('UPDATE orders SET order_status = ? WHERE id = ?', [status, orderId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update order status' });
    res.json({ message: 'Order status updated successfully', orderId, newStatus: status });
  });
});

// Fallback to index.html for SPA/HTML routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 D's Wrapping Studio Express Backend Running!`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`📦 Database: SQLite (dswrapping.db)`);
  console.log(`==================================================`);
});
