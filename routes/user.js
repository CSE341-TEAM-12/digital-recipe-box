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

router.put('/:id', validateObjectId, userController.updateUserProfile);
/* #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the user to update',
    required: true,
    type: 'string'
} */

/* #swagger.requestBody = {
    required: true,
    content: {
        "application/json": {
            schema: {
                type: 'object',
                properties: {
                    displayName: { type: 'string', example: 'Jane Doe' },
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'jane.doe@example.com' },
                    profileImageUrl: { type: 'string', example: 'https://example.com/images/jane.jpg' }
                }
            }
        }
    }
} */

/* #swagger.responses[200] = {
    description: 'User profile updated successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User profile updated successfully' },
            user: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                    displayName: { type: 'string', example: 'Jane Doe' },
                    firstName: { type: 'string', example: 'Jane' },
                    lastName: { type: 'string', example: 'Doe' },
                    email: { type: 'string', example: 'jane.doe@example.com' },
                    profileImageUrl: { type: 'string', example: 'https://example.com/images/jane.jpg' }
                }
            }
        }
    }
} */

/* #swagger.responses[400] = {
    description: 'Invalid user ID',
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'Invalid user ID' }
        }
    }
} */

/* #swagger.responses[404] = {
    description: 'User not found',
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'User not found' }
        }
    }
} */

/* #swagger.responses[500] = {
    description: 'Failed to update user profile',
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'Failed to update user profile' },
            details: { type: 'string', example: 'Error message goes here' }
        }
    }
} */

router.delete('/:id', validateObjectId, userController.deleteUserAccount);
/* #swagger.parameters['id'] = {
    in: 'path',
    description: 'ID of the user to delete',
    required: true,
    type: 'string'
} */

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
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'Invalid user ID' }
        }
    }
} */

/* #swagger.responses[404] = {
    description: 'User not found',
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'User not found' }
        }
    }
} */

/* #swagger.responses[500] = {
    description: 'Failed to delete user account',
    schema: {
        type: 'object',
        properties: {
            error: { type: 'string', example: 'Failed to delete user account' },
            details: { type: 'string', example: 'Error message goes here' }
        }
    }
} */


module.exports = router;
