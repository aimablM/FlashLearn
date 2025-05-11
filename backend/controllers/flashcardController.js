// controllers/flashcardController.js
const Flashcard = require('../models/Flashcard');
const FlashcardSet = require('../models/FlashcardSet');

/**
 * Get all flashcards for a set
 * @route GET /sets/:setId/flashcards
 * @access Public (but checks if non-public sets belong to requesting user)
 */
const getFlashcardsBySet = async (req, res) => {
  try {
    const setId = req.params.setId;
    
    // First check if set exists and if user has permission to view it
    const set = await FlashcardSet.findById(setId);
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    // Check if set is public or belongs to requesting user
    if (!set.isPublic && (!req.user || set.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view flashcards in this set' });
    }
    
    // Get all flashcards
    const flashcards = await Flashcard.find({ setId })
      .sort({ createdAt: 1 });
    
    res.json(flashcards);
  } catch (error) {
    console.error('Error in getFlashcardsBySet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new flashcard
 * @route POST /flashcards
 * @access Private (set owner only)
 */
const createFlashcard = async (req, res) => {
  try {
    const { setId, front, back } = req.body;
    
    // Verify set exists and user owns it
    const set = await FlashcardSet.findById(setId);
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    if (set.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add flashcards to this set' });
    }
    
    const flashcard = await Flashcard.create({
      setId,
      front,
      back
    });
    
    res.status(201).json(flashcard);
  } catch (error) {
    console.error('Error in createFlashcard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a flashcard
 * @route DELETE /flashcards/:id
 * @access Private (set owner only)
 */
const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);
    
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found' });
    }
    
    // Verify user owns the set containing this flashcard
    const set = await FlashcardSet.findById(flashcard.setId);
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    if (set.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this flashcard' });
    }
    
    await flashcard.remove();
    
    res.json({ message: 'Flashcard deleted' });
  } catch (error) {
    console.error('Error in deleteFlashcard:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getFlashcardsBySet,
  createFlashcard,
  deleteFlashcard
};