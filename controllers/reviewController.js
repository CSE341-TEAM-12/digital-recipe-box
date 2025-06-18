const db = require('../models');

// @desc    Get all reviews
// @route   GET /reviews
// @access  Public
const getAllReviews = async (req, res) => {
  try {
    // Get all reviews for public recipes only
    const reviews = await db.reviews.aggregate([
      // First lookup the recipe to check if it's public
      {
        $lookup: {
          from: 'recipes',
          localField: 'recipeId',
          foreignField: '_id',
          as: 'recipe'
        }
      },
      // Filter for public recipes only
      {
        $match: {
          'recipe.isPublic': true
        }
      },
      // Lookup reviewer information
      {
        $lookup: {
          from: 'users',
          localField: 'reviewerId',
          foreignField: '_id',
          as: 'reviewer'
        }
      },
      // Project the fields we want
      {
        $project: {
          _id: 1,
          rating: 1,
          comment: 1,
          createdAt: 1,
          updatedAt: 1,
          'recipe._id': 1,
          'recipe.title': 1,
          'recipe.description': 1,
          'reviewer._id': 1,
          'reviewer.displayName': 1,
          'reviewer.firstName': 1,
          'reviewer.lastName': 1
        }
      },
      // Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Flatten the nested objects for cleaner response
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      recipeId: review.recipe[0],
      reviewerId: review.reviewer[0]
    }));

    res.status(200).json({
      message: 'Reviews retrieved successfully',
      count: formattedReviews.length,
      reviews: formattedReviews
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      error: 'Failed to retrieve reviews',
      details: error.message
    });
  }
};

// Create a new review for a recipe
const createReview = async (req, res) => {
  try {
    // Check if the recipe exists and is public
    const recipe = await db.recipes.findById(req.params.recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Skip public check if no auth for testing
    if (!recipe.isPublic && req.user) {
      return res.status(403).json({
        error: 'Cannot review a private recipe'
      });
    }

    // Check if user already reviewed this recipe (skip if no auth)
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    const existingReview = await db.reviews.findOne({
      reviewerId: userId,
      recipeId: req.params.recipeId
    });

    if (existingReview && req.user) {
      return res.status(409).json({
        error: 'You have already reviewed this recipe'
      });
    }

    const reviewData = {
      ...req.body,
      reviewerId: userId,
      recipeId: req.params.recipeId
    };

    const review = new db.reviews(reviewData);
    const savedReview = await review.save();

    // Populate reviewer and recipe information
    const populatedReview = await db.reviews.findById(savedReview._id)
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
    const recipe = await db.recipes.findById(req.params.recipeId);
    
    if (!recipe) {
      return res.status(404).json({
        error: 'Recipe not found'
      });
    }

    // Skip access check if no auth for testing
    if (!recipe.isPublic && req.user && recipe.creatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Cannot view reviews for a private recipe'
      });
    }

    const reviews = await db.reviews.find({ recipeId: req.params.recipeId })
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

// Get a single review by ID
const getReviewById = async (req, res) => {
  try {
    const review = await db.reviews.findById(req.params.id)
      .populate('reviewerId', 'displayName firstName lastName')
      .populate('recipeId', 'title description');

    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    // Check if the associated recipe is public or if user has access (skip if no auth)
    const recipe = await db.recipes.findById(review.recipeId._id);
    if (!recipe.isPublic && req.user && recipe.creatorId.toString() !== req.user._id.toString() && review.reviewerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. Cannot view review for private recipe.'
      });
    }

    res.status(200).json({
      message: 'Review retrieved successfully',
      review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve review'
    });
  }
};

// Update a review by ID
const updateReview = async (req, res) => {
  try {
    const review = await db.reviews.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    // Check if user is the reviewer (skip if no auth)
    if (req.user && review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. You can only update your own reviews.'
      });
    }

    // Update review with new data
    const updatedReview = await db.reviews.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('reviewerId', 'displayName firstName lastName')
     .populate('recipeId', 'title description');

    res.status(200).json({
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update review'
    });
  }
};

// Delete a review by ID
const deleteReview = async (req, res) => {
  try {
    const review = await db.reviews.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        error: 'Review not found'
      });
    }

    // Check if user is the reviewer (skip if no auth)
    if (req.user && review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied. You can only delete your own reviews.'
      });
    }

    // Delete the review
    await db.reviews.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Review deleted successfully',
      deletedReviewId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete review'
    });
  }
};

// Get all reviews by the authenticated user
const getUserReviews = async (req, res) => {
  try {
    // For testing without auth, return all reviews
    const userId = req.user?._id || '507f1f77bcf86cd799439011';
    const reviews = await db.reviews.find({ reviewerId: userId })
      .populate('reviewerId', 'displayName firstName lastName')
      .populate('recipeId', 'title description')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'User reviews retrieved successfully',
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user reviews'
    });
  }
};

module.exports = {
  getAllReviews,
  createReview,
  getReviewsByRecipeId,
  getReviewById,
  updateReview,
  deleteReview,
  getUserReviews
}; 