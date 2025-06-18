const router = require('express').Router();
const recipeController = require('../controllers/recipeController');
const { authenticateUser } = require('../middleware/auth');
const { validateRecipe, validateObjectId } = require('../middleware/validation');

router.get('/', (req, res, next) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get all public recipes'
  // #swagger.description = 'Retrieve a list of all public recipes available to all users. This endpoint returns recipes that have been marked as public by their creators.'
  recipeController.getPublicRecipes(req, res, next);
});
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

router.get('/user', (req, res, next) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Get all user recipes'
  // #swagger.description = 'Get all recipes (both public and private) owned by the authenticated user. Requires authentication.'
  // #swagger.security = [{ "googleAuth": [] }]
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    recipeController.getUserRecipes(req, res, next);
  });
});
/* #swagger.responses[200] = {
    description: 'User recipes retrieved successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'User recipes retrieved successfully' },
            count: { type: 'number', example: 3 },
            recipes: {
                type: 'array',
                items: { $ref: '#/definitions/Recipe' }
            }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
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

router.post('/', (req, res, next) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Create a new recipe'
  // #swagger.description = 'Create a new recipe with ingredients, instructions, and metadata. Requires authentication. The recipe will be associated with the authenticated user.'
  // #swagger.security = [{ "googleAuth": [] }]
  // #swagger.parameters['body'] = { in: 'body', description: 'Recipe data', required: true, schema: { $ref: '#/definitions/RecipeInput' } }
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    validateRecipe(req, res, (err2) => {
      if (err2) return next(err2);
      recipeController.createRecipe(req, res, next);
    });
  });
});
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

router.put('/:id', (req, res, next) => {
  // #swagger.tags = ['Recipes']
  // #swagger.summary = 'Update a recipe by ID'
  // #swagger.description = 'Update an existing recipe. Only the recipe creator can update their own recipes. Requires authentication.'
  // #swagger.security = [{ "googleAuth": [] }]
  // #swagger.parameters['id'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
  // #swagger.parameters['body'] = { in: 'body', description: 'Updated recipe data', required: true, schema: { $ref: '#/definitions/RecipeInput' } }
  authenticateUser(req, res, (err) => {
    if (err) return next(err);
    validateObjectId(req, res, (err2) => {
      if (err2) return next(err2);
      validateRecipe(req, res, (err3) => {
        if (err3) return next(err3);
        recipeController.updateRecipe(req, res, next);
      });
    });
  });
});
/* #swagger.responses[200] = {
    description: 'Recipe updated successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Recipe updated successfully' },
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
/* #swagger.responses[403] = {
    description: 'Access denied - not the recipe creator',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Recipe not found',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Recipes']
// #swagger.summary = 'Delete a recipe by ID'
// #swagger.description = 'Delete a recipe and all its associated reviews. Only the recipe creator can delete their own recipes. Requires authentication.'
// #swagger.security = [{ "googleAuth": [] }]
// #swagger.parameters['id'] = { in: 'path', description: 'Recipe ID', required: true, type: 'string' }
router.delete('/:id', authenticateUser, validateObjectId, recipeController.deleteRecipe);
/* #swagger.responses[200] = {
    description: 'Recipe deleted successfully',
    schema: {
        type: 'object',
        properties: {
            message: { type: 'string', example: 'Recipe and associated reviews deleted successfully' },
            deletedRecipeId: { type: 'string', example: '507f1f77bcf86cd799439011' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication required',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[403] = {
    description: 'Access denied - not the recipe creator',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[404] = {
    description: 'Recipe not found',
    schema: { $ref: '#/definitions/Error' }
} */

module.exports = router;
