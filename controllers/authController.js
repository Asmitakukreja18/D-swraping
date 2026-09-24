const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ds_wrapping_studio_secret_key_2026';

// POST /api/auth/register
exports.register = (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, error: 'Full name, email and password are required' });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
    [fullName, email.toLowerCase().trim(), phone || '', hash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ success: false, error: 'Email address is already registered' });
        }
        return res.status(500).json({ success: false, error: 'User registration failed' });
      }

      const userId = this.lastID;
      const token = jwt.sign({ id: userId, email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        success: true,
        message: 'Account created successfully',
        token,
        user: { id: userId, fullName, email, phone, role: 'customer' }
      });
    }
  );
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
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
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  db.get('SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  });
};
