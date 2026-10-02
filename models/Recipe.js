const mongoose = require('mongoose');

// Recipe schema definition
const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a recipe title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a recipe description'],
    trim: true,
  },
  ingredients: {
    type: [String],
    required: [true, 'Please provide at least one ingredient'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Recipe must have at least one ingredient',
    },
  },
  steps: {
    type: [String],
    required: [true, 'Please provide at least one cooking step'],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'Recipe must have at least one cooking step',
    },
  },
  imagePath: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    default: 'General',
  },
  prepTime: {
    type: String,
    default: '30 mins',
  },
  servings: {
    type: String,
    default: '2-4 servings',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Recipe', recipeSchema);
