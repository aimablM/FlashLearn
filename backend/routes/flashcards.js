// routes/flashcards.js
const express = require('express');
const router = express.Router();
const { createFlashcard, deleteFlashcard } = require('../controllers/flashcardController');
const { protect } = require('../middleware/auth');

// @route   POST /flashcards
// @desc    Create a new flashcard
// @access  Private (set owner only, verified in controller)
router.post('/', protect, createFlashcard);

// @route   DELETE /flashcards/:id
// @desc    Delete a flashcard
// @access  Private (set owner only, verified in controller)
router.delete('/:id', protect, deleteFlashcard);

module.exports = router;