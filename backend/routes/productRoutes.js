const express = require('express');
const router = express.Router();
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getSellerProducts
} = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Public route to fetch products
router.get('/', getProducts);

// Protected routes (Seller/Admin only)
router.get('/seller/me', verifyToken, checkRole(['Seller']), getSellerProducts);
router.post('/', verifyToken, checkRole(['Seller', 'Admin']), createProduct);
router.put('/:id', verifyToken, checkRole(['Seller', 'Admin']), updateProduct);
router.delete('/:id', verifyToken, checkRole(['Seller', 'Admin']), deleteProduct);

module.exports = router;
