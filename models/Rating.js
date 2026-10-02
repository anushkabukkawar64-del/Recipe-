const mongoose = require('mongoose');

// Rating schema definition
const ratingSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Recipe reference is required'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
  },
  value: {
    type: Number,
    required: [true, 'Rating value is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index to guarantee one rating per user per recipe at database level
ratingSchema.index({ recipe: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
