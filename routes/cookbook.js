const router = require('express').Router();
const cookbookController = require('../controllers/cookbookController');
const { authenticateUser } = require('../middleware/auth');
const { validateCookbook, validateObjectId } = require('../middleware/validation');

// #swagger.tags = ['Cookbooks']
// #swagger.summary = 'Get all user cookbooks'
// #swagger.description = 'Get all cookbooks owned by the authenticated user. This endpoint returns a list of cookbooks that belong to the logged-in user.'
// #swagger.security = [{ "googleAuth": [] }]
router.get('/', authenticateUser, cookbookController.getUserCookbooks);
/* #swagger.responses[200] = {
    description: 'User cookbooks retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User cookbooks retrieved successfully' },
            count: { type: 'number', example: 1 },
            cookbooks: {
                type: 'array',
                items: { $ref: '#/definitions/Cookbook' }
            }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Cookbooks']
// #swagger.summary = 'Get a single cookbook by ID'
// #swagger.description = 'Get a specific cookbook by its ID. Public endpoint that allows viewing cookbooks.'
// #swagger.parameters['id'] = { in: 'path', description: 'Cookbook ID', required: true, type: 'string' }
router.get('/:id', ...validateObjectId, cookbookController.getCookbookById);
/* #swagger.responses[200] = {
    description: 'Cookbook retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Cookbook retrieved successfully' },
            cookbook: { $ref: '#/definitions/Cookbook' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Access denied - not the owner',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Cookbook not found',
    schema: { $ref: '#/definitions/Error' }
} */

router.post('/', authenticateUser, ...validateCookbook, cookbookController.createCookbook);
/* #swagger.tags = ['Cookbooks']
   #swagger.summary = 'Create a new cookbook'
   #swagger.description = 'Create a new cookbook with a name, description, and optional recipe collection. Requires authentication. The cookbook will be associated with the authenticated user.'
   #swagger.security = [{ "googleAuth": [] }]
   #swagger.parameters['body'] = { in: 'body', description: 'Cookbook data', required: true, schema: { $ref: '#/definitions/CookbookInput' } } */
/* #swagger.responses[201] = {
    description: 'Cookbook created successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Cookbook created successfully' },
            cookbook: { $ref: '#/definitions/Cookbook' }
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

router.put('/:id', authenticateUser, ...validateObjectId, ...validateCookbook, cookbookController.updateCookbook);
/* #swagger.tags = ['Cookbooks']
   #swagger.summary = 'Update a cookbook by ID'
   #swagger.description = 'Update an existing cookbook with new name, description, or recipe collection. Only the cookbook owner can update their own cookbooks. Requires authentication.'
   #swagger.security = [{ "googleAuth": [] }]
   #swagger.parameters['id'] = { in: 'path', description: 'Cookbook ID', required: true, type: 'string' }
   #swagger.parameters['body'] = { in: 'body', description: 'Updated cookbook data', required: true, schema: { $ref: '#/definitions/CookbookInput' } } */
/* #swagger.responses[200] = {
    description: 'Cookbook updated successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Cookbook updated successfully' },
            cookbook: { $ref: '#/definitions/Cookbook' }
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
    description: 'Access denied - not the cookbook owner',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Cookbook not found',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Cookbooks']
// #swagger.summary = 'Delete a cookbook by ID'
// #swagger.description = 'Delete a cookbook permanently. Only the cookbook owner can delete their own cookbooks. This action cannot be undone. Requires authentication.'
// #swagger.security = [{ "googleAuth": [] }]
// #swagger.parameters['id'] = { in: 'path', description: 'Cookbook ID', required: true, type: 'string' }
router.delete('/:id', authenticateUser, ...validateObjectId, cookbookController.deleteCookbook);
/* #swagger.responses[200] = {
    description: 'Cookbook deleted successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Cookbook deleted successfully' },
            deletedCookbookId: { type: 'string', example: '507f1f77bcf86cd799439011' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Access denied - not the cookbook owner',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Cookbook not found',
    schema: { $ref: '#/definitions/Error' }
} */

module.exports = router;
