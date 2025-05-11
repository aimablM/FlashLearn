// routes/sets.js
const express = require('express');
const router = express.Router();
const { 
  getPublicSets, 
  getSetById, 
  createSet, 
  updateSet, 
  deleteSet 
} = require('../controllers/setController');
const { getFlashcardsBySet } = require('../controllers/flashcardController');
const { protect, isOwner } = require('../middleware/auth');

// @route   GET /sets/public
// @desc    Get all public sets
// @access  Public
router.get('/public', getPublicSets);

// @route   GET /sets/:id
// @desc    Get a set by ID
// @access  Public or Private (depending on set visibility)
router.get('/:id', getSetById);

// @route   POST /sets
// @desc    Create a new set
// @access  Private
router.post('/', protect, createSet);

// @route   PUT /sets/:id
// @desc    Update a set
// @access  Private (owner only)
router.put('/:id', protect, isOwner('id', 'userId'), updateSet);

// @route   DELETE /sets/:id
// @desc    Delete a set and its flashcards
// @access  Private (owner only)
router.delete('/:id', protect, isOwner('id', 'userId'), deleteSet);

// @route   GET /sets/:setId/flashcards
// @desc    Get all flashcards for a set
// @access  Public or Private (depending on set visibility)
router.get('/:setId/flashcards', getFlashcardsBySet);

module.exports = router;