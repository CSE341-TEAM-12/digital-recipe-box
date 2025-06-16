const router = require('express').Router();
const recipeController = require('../controllers/recipeController');
const { authenticateUser } = require('../middleware/auth');
const { validateRecipe, validateObjectId } = require('../middleware/validation');

// @route   GET /recipes
// @desc    Get all public recipes
// @access  Public
router.get('/', recipeController.getPublicRecipes);

// @route   GET /recipes/:id
// @desc    Get a single recipe by ID
// @access  Public/Private (depends on recipe visibility)
router.get('/:id', validateObjectId, recipeController.getRecipeById);

// @route   POST /recipes
// @desc    Create a new recipe
// @access  Protected
router.post('/', authenticateUser, validateRecipe, recipeController.createRecipe);

module.exports = router;
