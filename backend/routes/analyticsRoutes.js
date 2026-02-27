const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// Protected route for Admins to view application analytics
router.get('/', verifyToken, checkRole(['Admin']), getAnalytics);

module.exports = router;
