const router = require('express').Router();
const cookbookController = require('../controllers/cookbookController');
const { authenticateUser } = require('../middleware/auth');
const { validateCookbook, validateObjectId } = require('../middleware/validation');

// #swagger.tags = ['Cookbooks']
// #swagger.summary = 'Get all user cookbooks'
// #swagger.description = 'Get all cookbooks owned by the authenticated user. This endpoint returns a list of cookbooks that belong to the logged-in user.'
// #swagger.security = [{ "bearerAuth": [] }]
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
// #swagger.description = 'Get a specific cookbook by its ID. User must be the owner of the cookbook to access it.'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.parameters['id'] = { in: 'path', description: 'Cookbook ID', required: true, type: 'string' }
router.get('/:id', authenticateUser, validateObjectId, cookbookController.getCookbookById);
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

// #swagger.tags = ['Cookbooks']
// #swagger.summary = 'Create a new cookbook'
// #swagger.description = 'Create a new cookbook with a name, description, and optional recipe collection. Requires authentication. The cookbook will be associated with the authenticated user.'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.parameters['body'] = { in: 'body', description: 'Cookbook data', required: true, schema: { $ref: '#/definitions/CookbookInput' } }
router.post('/', authenticateUser, validateCookbook, cookbookController.createCookbook);
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
router.put('./:id', authenticateUser, validateCookbook, cookbookController.updateCookbook);
router.delete('./:id', authenticateUser, validateObjectId, cookbookController.deleteCookbook);


module.exports = router;
