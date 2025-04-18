const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, checkUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get current user profile
router.get('/profile', getUserProfile);

// Create or update user profile
router.post('/profile', updateUserProfile);

// Check if user profile is complete
router.get('/profile/check', checkUserProfile);

module.exports = router; 