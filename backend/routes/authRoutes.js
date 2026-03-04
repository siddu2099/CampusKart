const express = require('express');
const router = express.Router();
const { register, login, verifyRegistration } = require('../controllers/authController');

router.post('/register', register);
router.post('/verify-registration', verifyRegistration);
router.post('/login', login);

module.exports = router;
