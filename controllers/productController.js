const Product = require('../models/Product');

// GET /api/products
exports.getAllProducts = (req, res) => {
  Product.getAll((err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to fetch products' });
    res.json({ success: true, count: rows.length, products: rows });
  });
};

// GET /api/products/:id
exports.getProductById = (req, res) => {
  Product.getById(req.params.id, (err, row) => {
    if (err || !row) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, product: row });
  });
};

// POST /api/products (Admin)
exports.createProduct = (req, res) => {
  const { name, category, price_inr, img, description } = req.body;
  if (!name || !category || !price_inr || !img) {
    return res.status(400).json({ success: false, error: 'Name, category, price, and image URL are required' });
  }

  Product.create({ name, category, price_inr, img, description }, (err, newId) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to create product' });
    res.status(201).json({ success: true, message: 'Product created successfully', productId: newId });
  });
};

// PUT /api/products/:id (Admin)
exports.updateProduct = (req, res) => {
  const productId = req.params.id;
  const { name, category, price_inr, img, description } = req.body;

  Product.update(productId, { name, category, price_inr, img, description }, (err) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to update product' });
    res.json({ success: true, message: 'Product updated successfully' });
  });
};

// DELETE /api/products/:id (Admin)
exports.deleteProduct = (req, res) => {
  Product.delete(req.params.id, (err) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to delete product' });
    res.json({ success: true, message: 'Product deleted successfully' });
  });
};
