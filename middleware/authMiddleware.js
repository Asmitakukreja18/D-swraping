const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ds_wrapping_studio_secret_key_2026';

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required. Please login.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired session token.' });
    }
    req.user = decoded;
    next();
  });
}

function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.email === 'admin@dswrapping.com')) {
      next();
    } else {
      res.status(403).json({ success: false, error: 'Admin privileges required' });
    }
  });
}

module.exports = {
  verifyToken,
  verifyAdmin
};
