const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Route for user registration
router.post('/signup', registerUser);

// Route for user login
router.post('/login', loginUser);

module.exports = router;
