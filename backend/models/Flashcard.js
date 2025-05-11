// models/Flashcard.js
const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
  setId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashcardSet',
    required: [true, 'Flashcard must belong to a set'],
    index: true
  },
  front: {
    type: String,
    required: [true, 'Front content is required'],
    trim: true
  },
  back: {
    type: String,
    required: [true, 'Back content is required'],
    trim: true
  }
}, { 
  timestamps: true 
});

// Create index for faster querying by setId
flashcardSchema.index({ setId: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;