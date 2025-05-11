// routes/users.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserStats } = require('../controllers/userController');
const { getUserSets } = require('../controllers/setController');
const { protect, isOwner } = require('../middleware/auth');

// @route   GET /users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', protect, isOwner('id', 'id'), getUserProfile);

// @route   PUT /users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', protect, isOwner('id', 'id'), updateUserProfile);

// @route   GET /users/:id/stats
// @desc    Get user statistics
// @access  Private
router.get('/:id/stats', protect, isOwner('id', 'id'), getUserStats);

// @route   GET /users/:id/sets
// @desc    Get all sets for a user
// @access  Private
router.get('/:id/sets', protect, isOwner('id', 'id'), getUserSets);

module.exports = router;