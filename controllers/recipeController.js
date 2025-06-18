const db = require('../models');

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      creatorId: req.user?._id || '507f1f77bcf86cd799439011' // Fallback for testing without auth
    };

    const recipe = new db.recipes(recipeData);
    const savedRecipe = await recipe.save();

    // Populate creator information
    const populatedRecipe = await db.recipes.findById(savedRecipe._id)
      .populate('creatorId', 'displayName firstName lastName');

    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: populatedRecipe
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create recipe'
    });
  }
};

// Get all public recipes
const getPublicRecipes = async (req, res) => {
  try {
    const recipes = await db.recipes.find({ isPublic: true })
      .populate('creatorId', 'displayName firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Public recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Error fetching public recipes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve recipes'
    });
  }
};

// Get a single recipe by ID
const getRecipeById = async (req, res) => {
  try {
    const recipe = await db.recipes.findById(req.params.id)
      .populate('creatorId', 'displayName firstName lastName');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Check if recipe is public or if user is the creator (skip check if no auth)
    if (!recipe.isPublic && req.user && recipe.creatorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. This recipe is private.'
      });
    }

    res.status(200).json({
      message: 'Recipe retrieved successfully',
      recipe
    });
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve recipe'
    });
  }
};

// Update a recipe by ID
const updateRecipe = async (req, res) => {
  try {
    const recipe = await db.recipes.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Check if user is the creator (skip check if no auth)
    if (req.user && recipe.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. You can only update your own recipes.'
      });
    }

    // Update recipe with new data
    const updatedRecipe = await db.recipes.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('creatorId', 'displayName firstName lastName');

    res.status(200).json({
      message: 'Recipe updated successfully',
      recipe: updatedRecipe
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update recipe'
    });
  }
};

// Delete a recipe by ID
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await db.recipes.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Check if user is the creator (skip check if no auth)
    if (req.user && recipe.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own recipes.'
      });
    }

    // Delete associated reviews first
    await db.reviews.deleteMany({ recipeId: req.params.id });

    // Delete the recipe
    await db.recipes.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Recipe and associated reviews deleted successfully',
      deletedRecipeId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete recipe'
    });
  }
};

// Get all recipes by the authenticated user (both public and private)
const getUserRecipes = async (req, res) => {
  try {
    // For testing without auth, return all recipes
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    const recipes = await db.recipes.find({ creatorId: userId })
      .populate('creatorId', 'displayName firstName lastName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'User recipes retrieved successfully',
      count: recipes.length,
      recipes
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user recipes'
    });
  }
};

module.exports = {
  createRecipe,
  getPublicRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  getUserRecipes
}; 