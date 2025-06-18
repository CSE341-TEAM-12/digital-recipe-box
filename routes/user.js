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

// #swagger.tags = ['Users']
// #swagger.summary = 'Update user profile'
// #swagger.description = 'Update the profile information of a specific user. Users can update their own profile information including display name, first name, last name, email, and profile image URL.'
// #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
// #swagger.parameters['body'] = { in: 'body', description: 'User profile data to update', required: true, schema: { $ref: '#/definitions/UserUpdateInput' } }
router.put('/:id', validateObjectId, userController.updateUserProfile);
/* #swagger.responses[200] = {
    description: 'User profile updated successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User profile updated successfully' },
            user: { $ref: '#/definitions/User' }
        }
    }
} */
/* #swagger.responses[400] = {
    description: 'Invalid user ID or validation error',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'User not found',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[500] = {
    description: 'Failed to update user profile',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Users']
// #swagger.summary = 'Delete user account'
// #swagger.description = 'Permanently delete a user account. This action cannot be undone and will remove all user data from the system.'
// #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
router.delete('/:id', validateObjectId, userController.deleteUserAccount);
/* #swagger.responses[200] = {
    description: 'User account deleted successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User account deleted successfully' }
        }
    }
} */
/* #swagger.responses[400] = {
    description: 'Invalid user ID',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'User not found',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[500] = {
    description: 'Failed to delete user account',
    schema: { $ref: '#/definitions/Error' }
} */

module.exports = router;
