const db = require('../models');

// Create a new recipe
const createRecipe = async (req, res) => {
  try {
    const recipeData = {
      ...req.body,
      creatorId: req.user.id // From authentication middleware
    };

    const recipe = new db.Recipe(recipeData);
    const savedRecipe = await recipe.save();

    // Populate creator information
    const populatedRecipe = await db.Recipe.findById(savedRecipe._id)
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
    const recipes = await db.Recipe.find({ isPublic: true })
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
    const recipe = await db.Recipe.findById(req.params.id)
      .populate('creatorId', 'displayName firstName lastName');

    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Check if recipe is public or if user is the creator
    if (!recipe.isPublic && recipe.creatorId._id.toString() !== req.user?.id) {
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

module.exports = {
  createRecipe,
  getPublicRecipes,
  getRecipeById
}; 