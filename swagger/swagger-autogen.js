const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Digital Recipe Box API",
    description: "REST API for Digital Recipe Box - A comprehensive recipe management system",
    version: "1.0.0",
    contact: {
      name: "CSE341 Team-12",
      url: "https://github.com/CSE341-TEAM-12/digital-recipe-box"
    }
  },
  // Don't hardcode host - let it be determined dynamically
  host: undefined,
  schemes: ['https', 'http'],
  tags: [
    {
      name: "General",
      description: "General API endpoints and information"
    },
    {
      name: "Recipes", 
      description: "Recipe management endpoints - Create, read, and manage cooking recipes with ingredients, instructions, cooking time, and serving information"
    },
    {
      name: "Cookbooks",
      description: "Cookbook management endpoints - Organize recipes into collections for better management and organization"
    },
    {
      name: "Reviews",
      description: "Recipe review endpoints - Rate and review recipes to help other users discover great recipes"
    }
  ],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT token for authentication. Format: Bearer {token}'
    }
  },
  consumes: ['application/json'],
  produces: ['application/json'],
  definitions: {
    Recipe: {
      title: 'Recipe Title',
      description: 'Recipe description',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      cookingTime: 30,
      servings: 4,
      category: 'Main Course',
      isPublic: true,
      createdBy: 'user_id'
    },
    RecipeInput: {
      title: 'Recipe Title',
      description: 'Recipe description', 
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      cookingTime: 30,
      servings: 4,
      category: 'Main Course',
      isPublic: true
    },
    Cookbook: {
      title: 'Cookbook Title',
      description: 'Cookbook description',
      recipes: ['recipe_id_1', 'recipe_id_2'],
      isPublic: true,
      createdBy: 'user_id'
    },
    CookbookInput: {
      title: 'Cookbook Title',
      description: 'Cookbook description',
      recipes: ['recipe_id_1', 'recipe_id_2'],
      isPublic: true
    },
    Review: {
      recipeId: 'recipe_id',
      rating: 5,
      comment: 'Great recipe!',
      reviewedBy: 'user_id'
    },
    ReviewInput: {
      recipeId: 'recipe_id',
      rating: 5,
      comment: 'Great recipe!'
    },
    Error: {
      message: 'Error message',
      status: 400
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = ['../routes/index.js'];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);