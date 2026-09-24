const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const hamperRoutes = require('./routes/hamperRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Frontend Files & Assets
app.use(express.static(path.join(__dirname)));

/* ==========================================================================
   MOUNT REST API ROUTES
   ========================================================================== */

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hamper', hamperRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    server: "D's Wrapping Studio Express REST API Server",
    database: 'SQLite (dswrapping.db)',
    time: new Date().toISOString()
  });
});

// Serve Admin Dashboard page
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback to index.html for SPA/HTML routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 D's Wrapping Studio Express Backend Server Running!`);
  console.log(`🌐 Website URL: http://localhost:${PORT}`);
  console.log(`🔑 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`📦 Database: SQLite (dswrapping.db)`);
  console.log(`==================================================`);
});
