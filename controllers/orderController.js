const Order = require('../models/Order');
const generateOrderId = require('../utils/generateOrderId');

// POST /api/orders
exports.createOrder = (req, res) => {
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
    return res.status(400).json({ success: false, error: 'Customer name, phone, address and cart items are required' });
  }

  const orderCode = generateOrderId();
  const itemsJSON = JSON.stringify(items);

  const orderData = {
    orderCode,
    userId: userId || null,
    customerName,
    customerPhone,
    shippingAddress,
    city,
    state,
    pincode,
    totalINR: totalINR || 0,
    currency: currency || 'INR',
    paymentMethod: paymentMethod || 'UPI',
    paymentStatus: 'Paid (Demo)',
    orderStatus: 'Order Placed',
    itemsJSON
  };

  Order.create(orderData, (err, newId) => {
    if (err) {
      console.error('Order Creation Error:', err);
      return res.status(500).json({ success: false, error: 'Failed to record order' });
    }

    res.status(201).json({
      success: true,
      message: 'Order created & saved to database',
      orderId: newId,
      orderCode,
      customerName,
      totalINR,
      estimatedDelivery: '3 to 5 Business Days (Pan-India)',
      paymentStatus: 'Paid (Demo)'
    });
  });
};

// GET /api/orders/:code
exports.getOrderByCode = (req, res) => {
  Order.getByCode(req.params.code, (err, order) => {
    if (err || !order) return res.status(404).json({ success: false, error: 'Order not found' });
    order.items = JSON.parse(order.items_json);
    res.json({ success: true, order });
  });
};

// GET /api/orders (Customer's orders)
exports.getUserOrders = (req, res) => {
  const userId = req.user ? req.user.id : null;
  if (!userId) return res.status(401).json({ success: false, error: 'User ID required' });

  Order.getByUserId(userId, (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    const formatted = rows.map(r => ({ ...r, items: JSON.parse(r.items_json) }));
    res.json({ success: true, count: formatted.length, orders: formatted });
  });
};

// GET /api/admin/orders (Admin View All Orders)
exports.getAllOrders = (req, res) => {
  Order.getAll((err, rows) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to fetch all orders' });
    const formatted = rows.map(r => ({ ...r, items: JSON.parse(r.items_json) }));
    res.json(formatted);
  });
};

// PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  Order.updateStatus(orderId, status, (err) => {
    if (err) return res.status(500).json({ success: false, error: 'Failed to update order status' });
    res.json({ success: true, message: 'Order status updated successfully', orderId, newStatus: status });
  });
};
