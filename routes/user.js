const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

// #swagger.tags = ['Users']
// #swagger.summary = 'Get current user profile'
// #swagger.description = 'Get the profile information of the currently authenticated user'
// #swagger.security = [{ "googleAuth": [] }]
router.get('/me', authenticateUser, userController.getCurrentUser);
/* #swagger.responses[200] = {
    description: 'User profile retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User profile retrieved successfully' },
            user: { $ref: '#/definitions/User' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[500] = {
    description: 'Internal server error',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Users']
// #swagger.summary = 'Get user recipes'
// #swagger.description = 'Get all public recipes created by a specific user'
// #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
router.get('/:id/recipes', validateObjectId, userController.getUserRecipes);
/* #swagger.responses[200] = {
    description: 'User recipes retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User recipes retrieved successfully' },
            user: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    displayName: { type: 'string', example: 'John Doe' }
                }
            },
            count: { type: 'number', example: 3 },
            recipes: {
                type: 'array',
                items: { $ref: '#/definitions/Recipe' }
            }
        }
    }
} */
/* #swagger.responses[404] = {
    description: 'User not found',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[500] = {
    description: 'Internal server error',
    schema: { $ref: '#/definitions/Error' }
} */

module.exports = router;
