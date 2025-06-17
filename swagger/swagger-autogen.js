const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: "Digital Recipe Box API",
    description: "REST API for Digital Recipe Box - A comprehensive recipe management system with Google OAuth authentication",
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
      name: "Authentication",
      description: "Google OAuth authentication endpoints - Login, logout, and authentication status"
    },
    {
      name: "Users",
      description: "User management endpoints - Get user profile and user recipes"
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
    googleAuth: {
      type: 'oauth2',
      authorizationUrl: '/auth/google',
      flow: 'implicit',
      scopes: {
        'profile': 'Access to user profile information',
        'email': 'Access to user email address'
      },
      description: 'Google OAuth 2.0 authentication. Use /auth/google to initiate login flow.'
    },
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT token for authentication. Format: Bearer {token} (For testing purposes only)'
    }
  },
  consumes: ['application/json'],
  produces: ['application/json'],
  definitions: {
    User: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        oauthId: { type: 'string', example: '123456789012345678901' },
        displayName: { type: 'string', example: 'John Doe' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        email: { type: 'string', example: 'john.doe@example.com' },
        profileImageUrl: { type: 'string', example: 'https://lh3.googleusercontent.com/a/default-user' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    Recipe: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        title: { type: 'string', example: 'Chocolate Chip Cookies' },
        description: { type: 'string', example: 'Classic homemade cookies' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'flour' },
              quantity: { type: 'string', example: '2 cups' }
            }
          }
        },
        instructions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Preheat oven to 375°F', 'Mix ingredients', 'Bake for 10 minutes']
        },
        prepTimeMinutes: { type: 'number', example: 15 },
        cookTimeMinutes: { type: 'number', example: 12 },
        servings: { type: 'number', example: 24 },
        isPublic: { type: 'boolean', example: true },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['dessert', 'cookies']
        },
        creatorId: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            displayName: { type: 'string', example: 'John Doe' }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    RecipeInput: {
      type: 'object',
      required: ['title'],
      properties: {
        title: { type: 'string', example: 'Chocolate Chip Cookies' },
        description: { type: 'string', example: 'Classic homemade cookies' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'flour' },
              quantity: { type: 'string', example: '2 cups' }
            }
          }
        },
        instructions: {
          type: 'array',
          items: { type: 'string' },
          example: ['Preheat oven to 375°F', 'Mix ingredients']
        },
        prepTimeMinutes: { type: 'number', example: 15 },
        cookTimeMinutes: { type: 'number', example: 12 },
        servings: { type: 'number', example: 24 },
        isPublic: { type: 'boolean', example: true },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['dessert', 'cookies']
        }
      }
    },
    Cookbook: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439013' },
        name: { type: 'string', example: 'My Dessert Collection' },
        description: { type: 'string', example: 'Sweet treats and desserts' },
        recipeIds: {
          type: 'array',
          items: { '$ref': '#/definitions/Recipe' }
        },
        ownerId: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
            displayName: { type: 'string', example: 'John Doe' }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    CookbookInput: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'My Dessert Collection' },
        description: { type: 'string', example: 'Sweet treats and desserts' },
        recipeIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['507f1f77bcf86cd799439011']
        }
      }
    },
    Review: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '507f1f77bcf86cd799439014' },
        rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', example: 'Absolutely delicious!' },
        reviewerId: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439015' },
            displayName: { type: 'string', example: 'Jane Smith' }
          }
        },
        recipeId: { type: 'string', example: '507f1f77bcf86cd799439011' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    },
    ReviewInput: {
      type: 'object',
      required: ['rating'],
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
        comment: { type: 'string', example: 'Absolutely delicious!' }
      }
    },
    Error: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Error message' },
        message: { type: 'string', example: 'Additional context' },
        details: {
          type: 'array',
          items: { type: 'string' },
          example: ['Specific validation errors']
        }
      }
    }
  }
};

const outputFile = './swagger.json';
// Include all route files directly for better scanning
const endpointsFiles = [
  '../routes/index.js',
  '../routes/auth.js',
  '../routes/user.js',
  '../routes/recipe.js',
  '../routes/cookbook.js',
  '../routes/review.js'
];

// generate swagger.json
swaggerAutogen(outputFile, endpointsFiles, doc);