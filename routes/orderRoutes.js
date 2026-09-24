const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getUserOrders);
router.get('/:code', orderController.getOrderByCode);

module.exports = router;
