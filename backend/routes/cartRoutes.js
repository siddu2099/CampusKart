const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// All cart routes require a logged-in Buyer
router.use(verifyToken);
router.use(checkRole(['Buyer']));

router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeFromCart);

module.exports = router;
