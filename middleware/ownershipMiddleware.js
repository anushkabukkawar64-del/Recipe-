const Recipe = require('../models/Recipe');

// Middleware to verify recipe ownership
const ownershipMiddleware = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if recipe exists
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found',
      });
    }

    // Check if logged in user is the owner of the recipe
    if (recipe.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You can only edit or delete your own recipes.',
      });
    }

    // Attach recipe to request for reuse
    req.recipe = recipe;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verifying recipe ownership',
      error: error.message,
    });
  }
};

module.exports = ownershipMiddleware;
