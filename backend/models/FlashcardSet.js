// models/FlashcardSet.js
const mongoose = require('mongoose');

const flashcardSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Set must belong to a user']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  tags: {
    type: [String],
    default: []
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Create index for faster querying by userId
flashcardSetSchema.index({ userId: 1 });
// Create index for faster querying public sets
flashcardSetSchema.index({ isPublic: 1 });

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

module.exports = FlashcardSet;