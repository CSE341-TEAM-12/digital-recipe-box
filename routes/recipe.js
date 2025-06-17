const router = require('express').Router();
const recipeController = require('../controllers/recipeController');
const { authenticateUser } = require('../middleware/auth');
const { validateRecipe, validateObjectId } = require('../middleware/validation');

// #swagger.tags = ['Recipes']
// #swagger.summary = 'Get all public recipes'
// #swagger.description = 'Retrieve a list of all public recipes available to all users. This endpoint returns recipes that have been marked as public by their creators.'
router.get('/', recipeController.getPublicRecipes);
/* #swagger.responses[200] = {
    description: 'List of recipes retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Public recipes retrieved successfully' },
            count: { type: 'number', example: 2 },
            recipes: {
                type: 'array',
                items: { $ref: '#/definitions/Recipe' }
            }
        }
    }
} */
/* #swagger.responses[500] = {
    description: 'Internal server error',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Recipes']
// #swagger.summary = 'Get a single recipe by ID'
// #swagger.description = 'Get a specific recipe by its ID. Public recipes can be accessed by anyone, while private recipes require authentication and ownership.'
// #swagger.parameters['id'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
router.get('/:id', validateObjectId, recipeController.getRecipeById);
/* #swagger.responses[200] = {
    description: 'Recipe retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Recipe retrieved successfully' },
            recipe: { $ref: '#/definitions/Recipe' }
        }
    }
} */
/* #swagger.responses[403] = {
    description: 'Access denied for private recipe',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Recipe not found',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Recipes']
// #swagger.summary = 'Create a new recipe'
// #swagger.description = 'Create a new recipe with ingredients, instructions, and metadata. Requires authentication. The recipe will be associated with the authenticated user.'
// #swagger.security = [{ "bearerAuth": [] }]
// #swagger.parameters['body'] = { in: 'body', description: 'Recipe data', required: true, schema: { $ref: '#/definitions/RecipeInput' } }
router.post('/', authenticateUser, validateRecipe, recipeController.createRecipe);
/* #swagger.responses[201] = {
    description: 'Recipe created successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Recipe created successfully' },
            recipe: { $ref: '#/definitions/Recipe' }
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

module.exports = router;
