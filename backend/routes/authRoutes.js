const express = require("express");
const router = express.Router();
const { registerUser, loginUser, deleteAccount, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
router.post("/register", registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate a user and get a token
// @access  Public
router.post("/login", loginUser);

router.post("/verify", verifyEmail); // <--- ADD THIS

router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
