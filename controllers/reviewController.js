const db = require('../models');

// Create a new review for a recipe
const createReview = async (req, res) => {
  try {
    // Check if the recipe exists and is public
    const recipe = await db.Recipe.findById(req.params.recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    if (!recipe.isPublic) {
      return res.status(403).json({
        error: 'Cannot review a private recipe'
      });
    }

    // Check if user already reviewed this recipe
    const existingReview = await db.Review.findOne({
      reviewerId: req.user.id,
      recipeId: req.params.recipeId
    });

    if (existingReview) {
      return res.status(409).json({
        error: 'You have already reviewed this recipe'
      });
    }

    const reviewData = {
      ...req.body,
      reviewerId: req.user.id,
      recipeId: req.params.recipeId
    };

    const review = new db.Review(reviewData);
    const savedReview = await review.save();

    // Populate reviewer and recipe information
    const populatedReview = await db.Review.findById(savedReview._id)
      .populate('reviewerId', 'displayName firstName lastName')
      .populate('recipeId', 'title description');

    res.status(201).json({
      message: 'Review created successfully',
      review: populatedReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create review'
    });
  }
};

// Get all reviews for a specific recipe
const getReviewsByRecipeId = async (req, res) => {
  try {
    // Check if the recipe exists and is public
    const recipe = await db.Recipe.findById(req.params.recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    if (!recipe.isPublic && recipe.creatorId.toString() !== req.user?.id) {
      return res.status(403).json({
        error: 'Cannot view reviews for a private recipe'
      });
    }

    const reviews = await db.Review.find({ recipeId: req.params.recipeId })
      .populate('reviewerId', 'displayName firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      recipeId: req.params.recipeId,
      count: reviews.length,
      averageRating: parseFloat(averageRating),
      reviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve reviews'
    });
  }
};

module.exports = {
  createReview,
  getReviewsByRecipeId
}; 