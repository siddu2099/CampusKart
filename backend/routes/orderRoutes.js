const express = require('express');
const router = express.Router();
const { placeOrder } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protected route for logged-in users to place an order
router.post('/', verifyToken, placeOrder);

module.exports = router;
