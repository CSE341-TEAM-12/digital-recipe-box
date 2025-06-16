const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/auth');
const { validateReview, validateRecipeId } = require('../middleware/validation');

// @route   GET /reviews/recipe/:recipeId
// @desc    Get all reviews for a specific recipe
// @access  Public (for public recipes)
router.get('/recipe/:recipeId', validateRecipeId, reviewController.getReviewsByRecipeId);

// @route   POST /reviews/recipe/:recipeId
// @desc    Add a new review to a recipe
// @access  Protected
router.post('/recipe/:recipeId', authenticateUser, validateRecipeId, validateReview, reviewController.createReview);

module.exports = router;
