// controllers/setController.js
const FlashcardSet = require('../models/FlashcardSet');
const Flashcard = require('../models/Flashcard');

/**
 * Get all flashcard sets for a user
 * @route GET /users/:id/sets
 * @access Private
 */
const getUserSets = async (req, res) => {
  try {
    const sets = await FlashcardSet.find({ userId: req.params.id })
      .sort({ updatedAt: -1 });
    
    res.json(sets);
  } catch (error) {
    console.error('Error in getUserSets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all public flashcard sets
 * @route GET /sets/public
 * @access Public
 */
const getPublicSets = async (req, res) => {
  try {
    const publicSets = await FlashcardSet.find({ isPublic: true })
      .sort({ updatedAt: -1 })
      .populate('userId', 'name'); // Include creator's name
    
    res.json(publicSets);
  } catch (error) {
    console.error('Error in getPublicSets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single flashcard set by ID
 * @route GET /sets/:id
 * @access Public (but checks if non-public sets belong to requesting user)
 */
const getSetById = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id)
      .populate('userId', 'name');
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    // Check if set is public or belongs to requesting user
    if (!set.isPublic && (!req.user || set.userId._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this set' });
    }
    
    res.json(set);
  } catch (error) {
    console.error('Error in getSetById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new flashcard set
 * @route POST /sets
 * @access Private
 */
const createSet = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;
    
    const set = await FlashcardSet.create({
      userId: req.user._id,
      title,
      description,
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic || false
    });
    
    res.status(201).json(set);
  } catch (error) {
    console.error('Error in createSet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a flashcard set
 * @route PUT /sets/:id
 * @access Private (owner only)
 */
const updateSet = async (req, res) => {
  try {
    const { title, description, tags, isPublic } = req.body;
    
    const set = await FlashcardSet.findById(req.params.id);
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    // Update fields
    set.title = title || set.title;
    set.description = description !== undefined ? description : set.description;
    set.tags = tags || set.tags;
    set.isPublic = isPublic !== undefined ? isPublic : set.isPublic;
    
    const updatedSet = await set.save();
    
    res.json(updatedSet);
  } catch (error) {
    console.error('Error in updateSet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a flashcard set and all its flashcards
 * @route DELETE /sets/:id
 * @access Private (owner only)
 */
const deleteSet = async (req, res) => {
  try {
    const set = await FlashcardSet.findById(req.params.id);
    
    if (!set) {
      return res.status(404).json({ message: 'Set not found' });
    }
    
    // Delete all flashcards in the set
    await Flashcard.deleteMany({ setId: set._id });
    
    // Delete the set
    await set.remove();
    
    res.json({ message: 'Set and all its flashcards deleted' });
  } catch (error) {
    console.error('Error in deleteSet:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserSets,
  getPublicSets,
  getSetById,
  createSet,
  updateSet,
  deleteSet
};