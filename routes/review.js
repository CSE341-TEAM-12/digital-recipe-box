const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const { authenticateUser } = require('../middleware/auth');
const { validateReview, validateRecipeId } = require('../middleware/validation');

// #swagger.tags = ['Reviews']
// #swagger.summary = 'Get all reviews for a recipe'
// #swagger.description = 'Get all reviews for a specific recipe. This endpoint returns reviews for public recipes and calculates the average rating.'
// #swagger.parameters['recipeId'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
router.get('/recipe/:recipeId', validateRecipeId, reviewController.getReviewsByRecipeId);
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
// #swagger.summary = 'Add a review to a recipe'
// #swagger.description = 'Add a new review to a recipe with rating and comment. Requires authentication. Users can only review public recipes and cannot review the same recipe twice.'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.parameters['recipeId'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
// #swagger.parameters['body'] = { in: 'body', description: 'Review data', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
router.post('/recipe/:recipeId', authenticateUser, validateRecipeId, validateReview, reviewController.createReview);
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

module.exports = router;
