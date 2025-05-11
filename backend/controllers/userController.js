// controllers/userController.js
const User = require('../models/user');
const FlashcardSet = require('../models/FlashcardSet');
const Flashcard = require('../models/Flashcard');

/**
 * Get user profile by ID
 * @route GET /users/:id
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user profile
 * @route PUT /users/:id
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.password) user.password = req.body.password;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone
    });
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user statistics
 * @route GET /users/:id/stats
 * @access Private
 */
const getUserStats = async (req, res) => {
  try {
    // Count sets created by user
    const setCount = await FlashcardSet.countDocuments({ userId: req.params.id });
    
    // Get all sets created by user
    const sets = await FlashcardSet.find({ userId: req.params.id });
    
    // Extract set IDs
    const setIds = sets.map(set => set._id);
    
    // Count flashcards across all user sets
    const flashcardCount = await Flashcard.countDocuments({ 
      setId: { $in: setIds } 
    });
    
    // Get user's public sets count
    const publicSetCount = await FlashcardSet.countDocuments({ 
      userId: req.params.id,
      isPublic: true
    });
    
    res.json({
      totalSets: setCount,
      publicSets: publicSetCount,
      totalFlashcards: flashcardCount
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserStats
};