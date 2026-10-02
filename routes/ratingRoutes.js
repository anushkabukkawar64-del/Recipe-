const express = require('express');
const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Recipe = require('../models/Recipe');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

// Helper to compute average rating and total count dynamically using MongoDB aggregation
const getRecipeRatingStats = async (recipeId) => {
  const stats = await Rating.aggregate([
    {
      $match: {
        recipe: new mongoose.Types.ObjectId(recipeId),
      },
    },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$value' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    return {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalRatings: stats[0].totalRatings,
    };
  }

  return {
    averageRating: 0,
    totalRatings: 0,
  };
};

// @route   POST /api/recipes/:id/rate
// @desc    Submit a rating (1 to 5) for a recipe
// @access  Private (Authenticated users only)
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { id: recipeId } = req.params;
    const { value } = req.body;
    const userId = req.user._id;

    // Validate recipe ID
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format',
      });
    }

    // Validate rating value
    const numericValue = Number(value);
    if (!numericValue || numericValue < 1 || numericValue > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating value must be an integer between 1 and 5',
      });
    }

    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check if user has already rated this recipe
    const existingRating = await Rating.findOne({
      recipe: recipeId,
      user: userId,
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this recipe. Duplicate ratings are not permitted.',
      });
    }

    // Create the rating
    const newRating = await Rating.create({
      recipe: recipeId,
      user: userId,
      value: numericValue,
    });

    // Calculate updated average dynamically
    const stats = await getRecipeRatingStats(recipeId);

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your rating has been recorded.',
      rating: newRating,
      stats,
    });
  } catch (error) {
    // Catch compound unique index violation error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this recipe.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while submitting rating',
      error: error.message,
    });
  }
});

// @route   GET /api/recipes/:id/average-rating
// @desc    Calculate and return the dynamic average rating and total ratings for a recipe
// @access  Public
router.get('/:id/average-rating', async (req, res) => {
  try {
    const { id: recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format',
      });
    }

    const stats = await getRecipeRatingStats(recipeId);

    return res.status(200).json({
      success: true,
      recipeId,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error calculating average rating',
      error: error.message,
    });
  }
});

// @route   GET /api/recipes/:id/ratings
// @desc    Get all ratings for a recipe with user details
// @access  Public
router.get('/:id/ratings', optionalAuth, async (req, res) => {
  try {
    const { id: recipeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format',
      });
    }

    const ratings = await Rating.find({ recipe: recipeId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const stats = await getRecipeRatingStats(recipeId);

    // Check if the current requesting user has already rated
    let userHasRated = false;
    let userRatingValue = null;
    if (req.user) {
      const userRating = ratings.find(
        (r) => r.user && r.user._id.toString() === req.user._id.toString()
      );
      if (userRating) {
        userHasRated = true;
        userRatingValue = userRating.value;
      }
    }

    return res.status(200).json({
      success: true,
      stats,
      userHasRated,
      userRatingValue,
      ratings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message,
    });
  }
});

module.exports = { router, getRecipeRatingStats };
