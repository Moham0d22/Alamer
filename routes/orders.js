const express = require('express');
const { createOrder, createPublicOrder, getUserOrders, getAllOrders, getOrderStats } = require('../controllers/orderController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// طلبات الضيوف بدون تسجيل دخول
router.post('/public', createPublicOrder);

router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);

// Admin routes
router.get('/', getAllOrders);
router.get('/stats', getOrderStats);

module.exports = router;