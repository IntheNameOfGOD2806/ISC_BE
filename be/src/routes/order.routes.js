const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { validateRequest } = require('../middlewares/validateRequest');
const {
  createOrderSchema,
  updateOrderStatusSchema,
} = require('../validators/order.validator');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// Public routes (no authentication required)
// PayOS webhook - https://isc-p4t8.onrender.com/api/orders/HandleWebhook
router.post('/HandleWebhook', orderController.handleWebhook);
router.post('/handlewebhook', orderController.handleWebhook); // lowercase variant
router.post('/webhook', orderController.handleWebhook); // simple variant

// Debug middleware to log all requests to this route
router.use((req, res, next) => {
  console.log(`Order route accessed: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// User routes (authenticated)
router.use(authenticate);
router.post(
  '/',
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.get('/', orderController.getUserOrders);
router.get('/number/:number', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/repay', orderController.repayOrder);

// Admin routes
router.get('/admin/all', authorize('admin'), orderController.getAllOrders);

router.patch(
  '/admin/:id/status',
  authorize('admin'),
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

// Update order status by order number (for payment systems)
router.patch(
  '/number/:number/status',
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatusByNumber
);

module.exports = router;
