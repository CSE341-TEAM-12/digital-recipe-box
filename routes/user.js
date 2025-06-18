const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticateUser } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');

router.get('/', (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get all users'
  // #swagger.description = 'Get a list of all users in the system with basic profile information. Returns public profile data only for privacy.'
  userController.getAllUsers(req, res, next);
});
/* #swagger.responses[200] = {
    description: 'Users retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Users retrieved successfully' },
            count: { type: 'number', example: 10 },
            users: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        displayName: { type: 'string', example: 'John Doe' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        profileImageUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                        createdAt: { type: 'string', format: 'date-time' }
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

router.get('/me', (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get current user profile'
  // #swagger.description = 'Get the profile information of the currently authenticated user'
  // #swagger.security = [{ "googleAuth": [] }]
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    userController.getCurrentUser(req, res, next);
  });
});
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

router.get('/:id/recipes', (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Get user recipes'
  // #swagger.description = 'Get all public recipes created by a specific user'
  // #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
  validateObjectId(req, res, (err) => {
    if (err) return next(err);
    userController.getUserRecipes(req, res, next);
  });
});
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

router.put('/:id', (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Update user profile'
  // #swagger.description = 'Update the profile information of a specific user. Users can update their own profile information including display name, first name, last name, email, and profile image URL.'
  // #swagger.security = [{ "googleAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
  // #swagger.parameters['body'] = { in: 'body', description: 'User profile data to update', required: true, schema: { $ref: '#/definitions/UserUpdateInput' } }
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    validateObjectId(req, res, (err2) => {
      if (err2) return next(err2);
      userController.updateUserProfile(req, res, next);
    });
  });
});
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

router.delete('/:id', (req, res, next) => {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Delete user account'
  // #swagger.description = 'Permanently delete a user account. This action cannot be undone and will remove all user data from the system.'
  // #swagger.security = [{ "googleAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', description: 'User ID', required: true, type: 'string' }
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    validateObjectId(req, res, (err2) => {
      if (err2) return next(err2);
      userController.deleteUserAccount(req, res, next);
    });
  });
});
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
