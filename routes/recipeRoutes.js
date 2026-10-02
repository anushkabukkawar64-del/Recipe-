const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const Recipe = require('../models/Recipe');
const Rating = require('../models/Rating');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const ownershipMiddleware = require('../middleware/ownershipMiddleware');
const { getRecipeRatingStats } = require('./ratingRoutes');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate clean unique filename: timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `recipe-${uniqueSuffix}${ext}`);
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only JPG, PNG, WEBP and GIF images are allowed.'),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Helper to safely parse array fields (ingredients / steps)
const parseArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) {
    return field
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter((item) => item.length > 0);
  }
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter((item) => item.length > 0);
      }
    } catch (e) {
      // Split by newline or comma if not JSON
      return field
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }
  return [];
};

// @route   GET /api/recipes
// @desc    Get all recipes (with search, category filter, creator info, and dynamic average rating)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Search by title or description
    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by category if provided
    if (category && category !== 'All') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    const recipes = await Recipe.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Fetch dynamic ratings for each recipe using aggregation
    const recipesWithRatings = await Promise.all(
      recipes.map(async (recipe) => {
        const stats = await getRecipeRatingStats(recipe._id);
        return {
          ...recipe.toObject(),
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: recipesWithRatings.length,
      recipes: recipesWithRatings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching recipes',
      error: error.message,
    });
  }
});

// @route   GET /api/recipes/my-recipes
// @desc    Get all recipes created by the authenticated user
// @access  Private
router.get('/my-recipes', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const recipesWithRatings = await Promise.all(
      recipes.map(async (recipe) => {
        const stats = await getRecipeRatingStats(recipe._id);
        return {
          ...recipe.toObject(),
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: recipesWithRatings.length,
      recipes: recipesWithRatings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user recipes',
      error: error.message,
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe details with dynamic ratings and user rating status
// @access  Public (optionalAuth to determine if viewer rated it or is owner)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipe ID format',
      });
    }

    const recipe = await Recipe.findById(id).populate('user', 'name email');
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Dynamic rating stats from aggregation
    const stats = await getRecipeRatingStats(id);

    // Check if current logged-in user has already rated
    let userHasRated = false;
    let userRating = null;
    let isOwner = false;

    if (req.user) {
      isOwner = recipe.user && recipe.user._id.toString() === req.user._id.toString();
      const existingRating = await Rating.findOne({
        recipe: id,
        user: req.user._id,
      });
      if (existingRating) {
        userHasRated = true;
        userRating = existingRating.value;
      }
    }

    return res.status(200).json({
      success: true,
      recipe: {
        ...recipe.toObject(),
        averageRating: stats.averageRating,
        totalRatings: stats.totalRatings,
        userHasRated,
        userRating,
        isOwner,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching recipe details',
      error: error.message,
    });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe with optional image upload
// @access  Private (Authenticated users only)
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const { title, description, ingredients, steps, category, prepTime, servings } =
        req.body;

      // Validation
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Recipe title and description are required',
        });
      }

      const parsedIngredients = parseArrayField(ingredients);
      const parsedSteps = parseArrayField(steps);

      if (parsedIngredients.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one ingredient',
        });
      }

      if (parsedSteps.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide at least one cooking step',
        });
      }

      // Handle image
      let imagePath = '';
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string') {
        imagePath = req.body.imageUrl.trim();
      }

      const newRecipe = await Recipe.create({
        title: title.trim(),
        description: description.trim(),
        ingredients: parsedIngredients,
        steps: parsedSteps,
        imagePath,
        category: category || 'General',
        prepTime: prepTime || '30 mins',
        servings: servings || '2-4 servings',
        user: req.user._id,
      });

      const populatedRecipe = await Recipe.findById(newRecipe._id).populate(
        'user',
        'name email'
      );

      return res.status(201).json({
        success: true,
        message: 'Recipe created successfully!',
        recipe: {
          ...populatedRecipe.toObject(),
          averageRating: 0,
          totalRatings: 0,
          isOwner: true,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error creating recipe',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/recipes/:id
// @desc    Update an existing recipe (Owner only)
// @access  Private
router.put(
  '/:id',
  authMiddleware,
  ownershipMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      const recipe = req.recipe; // Attached by ownershipMiddleware
      const { title, description, ingredients, steps, category, prepTime, servings } =
        req.body;

      if (title) recipe.title = title.trim();
      if (description) recipe.description = description.trim();
      if (category) recipe.category = category.trim();
      if (prepTime) recipe.prepTime = prepTime.trim();
      if (servings) recipe.servings = servings.trim();

      if (ingredients) {
        const parsed = parseArrayField(ingredients);
        if (parsed.length > 0) recipe.ingredients = parsed;
      }

      if (steps) {
        const parsed = parseArrayField(steps);
        if (parsed.length > 0) recipe.steps = parsed;
      }

      // If a new image file was uploaded
      if (req.file) {
        // Optional: remove old uploaded image if it existed in uploads
        if (recipe.imagePath && recipe.imagePath.startsWith('/uploads/')) {
          const oldFilePath = path.join(
            __dirname,
            '..',
            recipe.imagePath.replace(/^\//, '')
          );
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.error('Error deleting old image:', err.message);
            }
          }
        }
        recipe.imagePath = `/uploads/${req.file.filename}`;
      } else if (req.body.imageUrl && typeof req.body.imageUrl === 'string') {
        recipe.imagePath = req.body.imageUrl.trim();
      }

      await recipe.save();

      const stats = await getRecipeRatingStats(recipe._id);
      const populated = await Recipe.findById(recipe._id).populate('user', 'name email');

      return res.status(200).json({
        success: true,
        message: 'Recipe updated successfully!',
        recipe: {
          ...populated.toObject(),
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
          isOwner: true,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error updating recipe',
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe and associated ratings (Owner only)
// @access  Private
router.delete('/:id', authMiddleware, ownershipMiddleware, async (req, res) => {
  try {
    const recipe = req.recipe; // Attached by ownershipMiddleware

    // Delete associated uploaded file if exists
    if (recipe.imagePath && recipe.imagePath.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', recipe.imagePath.replace(/^\//, ''));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('Error removing recipe image:', err.message);
        }
      }
    }

    // Delete ratings associated with this recipe
    await Rating.deleteMany({ recipe: recipe._id });

    // Delete the recipe
    await Recipe.findByIdAndDelete(recipe._id);

    return res.status(200).json({
      success: true,
      message: 'Recipe and all associated ratings deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error deleting recipe',
      error: error.message,
    });
  }
});

module.exports = router;
