const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/auth');
const { validateReview, validateRecipeId, validateObjectId } = require('../middleware/validation');

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all reviews'
// #swagger.description = 'Get all reviews from the system. Only shows reviews for public recipes to respect privacy settings.'
router.get('/', reviewController.getAllReviews);
/* #swagger.responses[200] = {
    description: 'Reviews retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Reviews retrieved successfully' },
            count: { type: 'number', example: 25 },
            reviews: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        rating: { type: 'number', example: 4 },
                        comment: { type: 'string', example: 'Great recipe!' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        recipeId: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                title: { type: 'string', example: 'Chocolate Cake' },
                                description: { type: 'string', example: 'Delicious chocolate cake recipe' }
                            }
                        },
                        reviewerId: {
                            type: 'object',
                            properties: {
                                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                displayName: { type: 'string', example: 'John Doe' },
                                firstName: { type: 'string', example: 'John' },
                                lastName: { type: 'string', example: 'Doe' }
                            }
                        }
                    }
                }
            }
        }
    }
} */
/* #swagger.responses[500] = {
    description: 'Internal server error',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all reviews for a recipe'
// #swagger.description = 'Get all reviews for a specific recipe. This endpoint returns reviews for public recipes and calculates the average rating.'
// #swagger.parameters['recipeId'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
router.get('/recipe/:recipeId', ...validateRecipeId, reviewController.getReviewsByRecipeId);
/* #swagger.responses[200] = {
    description: 'Reviews retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Reviews retrieved successfully' },
            recipeId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            count: { type: 'number', example: 2 },
            averageRating: { type: 'number', example: 4.5 },
            reviews: {
                type: 'array',
                items: { $ref: '#/definitions/Review' }
            }
        }
    }
} */
/* #swagger.responses[403] = {
    description: 'Cannot view reviews for private recipe',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Recipe not found',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all user reviews'
// #swagger.description = 'Get all reviews created by the authenticated user across all recipes. Requires authentication.'
// #swagger.security = [{ "googleAuth": [] }]
router.get('/user', authenticateUser, reviewController.getUserReviews);
/* #swagger.responses[200] = {
    description: 'User reviews retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User reviews retrieved successfully' },
            count: { type: 'number', example: 5 },
            reviews: {
                type: 'array',
                items: { $ref: '#/definitions/Review' }
            }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get a single review by ID'
// #swagger.description = 'Get a specific review by its ID. Access is allowed if the associated recipe is public or if the user is the recipe creator or review author.'
// #swagger.parameters['id'] = { in: 'path', description: 'Review ID', required: true, type: 'string' }
router.get('/:id', ...validateObjectId, reviewController.getReviewById);
/* #swagger.responses[200] = {
    description: 'Review retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Review retrieved successfully' },
            review: { $ref: '#/definitions/Review' }
        }
    }
} */
/* #swagger.responses[403] = {
    description: 'Access denied for review of private recipe',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Review not found',
    schema: { $ref: '#/definitions/Error' }
} */

router.post('/recipe/:recipeId', authenticateUser, ...validateRecipeId, ...validateReview, reviewController.createReview);
/* #swagger.tags = ['Reviews']
   #swagger.summary = 'Add a review to a recipe'
   #swagger.description = 'Add a new review to a recipe with rating and comment. Requires authentication. Users can only review public recipes and cannot review the same recipe twice.'
   #swagger.security = [{ "googleAuth": [] }]
   #swagger.parameters['recipeId'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
   #swagger.parameters['body'] = { in: 'body', description: 'Review data', required: true, schema: { $ref: '#/definitions/ReviewInput' } } */
/* #swagger.responses[201] = {
    description: 'Review created successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Review created successfully' },
            review: { $ref: '#/definitions/Review' }
        }
    }
} */
/* #swagger.responses[400] = {
    description: 'Invalid input data or validation error',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Cannot review private recipe',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Recipe not found',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[409] = {
    description: 'User has already reviewed this recipe',
    schema: { $ref: '#/definitions/Error' }
} */

router.put('/:id', authenticateUser, ...validateObjectId, ...validateReview, reviewController.updateReview);
/* #swagger.tags = ['Reviews']
   #swagger.summary = 'Update a review by ID'
   #swagger.description = 'Update an existing review. Only the review author can update their own reviews. Requires authentication.'
   #swagger.security = [{ "googleAuth": [] }]
   #swagger.parameters['id'] = { in: 'path', description: 'Review ID', required: true, type: 'string' }
   #swagger.parameters['body'] = { in: 'body', description: 'Updated review data', required: true, schema: { $ref: '#/definitions/ReviewInput' } } */
/* #swagger.responses[200] = {
    description: 'Review updated successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Review updated successfully' },
            review: { $ref: '#/definitions/Review' }
        }
    }
} */
/* #swagger.responses[400] = {
    description: 'Invalid input data or validation error',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Access denied - not the review author',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Review not found',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Delete a review by ID'
// #swagger.description = 'Delete a review. Only the review author can delete their own reviews. Requires authentication.'
// #swagger.security = [{ "googleAuth": [] }]
// #swagger.parameters['id'] = { in: 'path', description: 'Review ID', required: true, type: 'string' }
router.delete('/:id', authenticateUser, ...validateObjectId, reviewController.deleteReview);
/* #swagger.responses[200] = {
    description: 'Review deleted successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Review deleted successfully' },
            deletedReviewId: { type: 'string', example: '507f1f77bcf86cd799439011' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Access denied - not the review author',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Review not found',
    schema: { $ref: '#/definitions/Error' }
} */

module.exports = router;
