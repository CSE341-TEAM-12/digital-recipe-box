const request = require('supertest');
const express = require('express');
const db = require('../models');
const recipeController = require('../controllers/recipeController');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
const mockAuth = (req, res, next) => {
  req.user = {
    _id: req.headers.testuserid || '507f1f77bcf86cd799439011',
    oauthId: '123456789',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile.jpg'
  };
  next();
};

// Set up routes
app.get('/recipes', recipeController.getPublicRecipes);
app.get('/recipes/user', mockAuth, recipeController.getUserRecipes);
app.get('/recipes/:id', recipeController.getRecipeById);

describe('Recipe Controller - GET Endpoints', () => {
  let testUser, testRecipe1, testRecipe2, privateRecipe;

  beforeEach(async () => {
    // Create test user
    testUser = new db.users({
      oauthId: '123456789',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      profileImageUrl: 'https://example.com/profile.jpg'
    });
    await testUser.save();

    // Create test recipes
    testRecipe1 = new db.recipes({
      title: 'Public Recipe 1',
      description: 'A delicious public recipe',
      ingredients: [
        { name: 'ingredient 1', quantity: '1 cup' },
        { name: 'ingredient 2', quantity: '2 tbsp' }
      ],
      instructions: ['step 1', 'step 2'],
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      isPublic: true,
      creatorId: testUser._id
    });
    await testRecipe1.save();

    testRecipe2 = new db.recipes({
      title: 'Public Recipe 2',
      description: 'Another public recipe',
      ingredients: [
        { name: 'ingredient A', quantity: '3 cups' },
        { name: 'ingredient B', quantity: '1 tsp' }
      ],
      instructions: ['step A', 'step B'],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      isPublic: true,
      creatorId: testUser._id
    });
    await testRecipe2.save();

    privateRecipe = new db.recipes({
      title: 'Private Recipe',
      description: 'A private recipe',
      ingredients: [
        { name: 'secret ingredient', quantity: '1 pinch' }
      ],
      instructions: ['secret step'],
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      servings: 1,
      isPublic: false,
      creatorId: testUser._id
    });
    await privateRecipe.save();
  });

  describe('GET /recipes - getPublicRecipes', () => {
    test('should return all public recipes successfully', async () => {
      const response = await request(app)
        .get('/recipes')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Public recipes retrieved successfully');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('recipes');
      expect(response.body.recipes).toHaveLength(2);
      
      // Check if only public recipes are returned
      const recipeIds = response.body.recipes.map(recipe => recipe._id);
      expect(recipeIds).toContain(testRecipe1._id.toString());
      expect(recipeIds).toContain(testRecipe2._id.toString());
      expect(recipeIds).not.toContain(privateRecipe._id.toString());
    });

    test('should return recipes with populated creator information', async () => {
      const response = await request(app)
        .get('/recipes')
        .expect(200);

      const recipe = response.body.recipes[0];
      expect(recipe).toHaveProperty('creatorId');
      expect(recipe.creatorId).toHaveProperty('displayName', 'Test User');
      expect(recipe.creatorId).toHaveProperty('firstName', 'Test');
      expect(recipe.creatorId).toHaveProperty('lastName', 'User');
    });

    test('should return recipes sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get('/recipes')
        .expect(200);

      const recipes = response.body.recipes;
      if (recipes.length > 1) {
        const firstRecipeDate = new Date(recipes[0].createdAt);
        const secondRecipeDate = new Date(recipes[1].createdAt);
        expect(firstRecipeDate.getTime()).toBeGreaterThanOrEqual(secondRecipeDate.getTime());
      }
    });

    test('should return empty array when no public recipes exist', async () => {
      // Delete all recipes
      await db.recipes.deleteMany({});

      const response = await request(app)
        .get('/recipes')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Public recipes retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.recipes).toHaveLength(0);
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.recipes, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get('/recipes')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve recipes');

      // Restore the original method
      db.recipes.find.mockRestore();
    });
  });

  describe('GET /recipes/:id - getRecipeById', () => {
    test('should return public recipe by ID successfully', async () => {
      const response = await request(app)
        .get(`/recipes/${testRecipe1._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Recipe retrieved successfully');
      expect(response.body).toHaveProperty('recipe');
      expect(response.body.recipe).toHaveProperty('_id', testRecipe1._id.toString());
      expect(response.body.recipe).toHaveProperty('title', 'Public Recipe 1');
      expect(response.body.recipe).toHaveProperty('isPublic', true);
    });

    test('should return recipe with populated creator information', async () => {
      const response = await request(app)
        .get(`/recipes/${testRecipe1._id}`)
        .expect(200);

      const recipe = response.body.recipe;
      expect(recipe).toHaveProperty('creatorId');
      expect(recipe.creatorId).toHaveProperty('displayName', 'Test User');
      expect(recipe.creatorId).toHaveProperty('firstName', 'Test');
      expect(recipe.creatorId).toHaveProperty('lastName', 'User');
    });

    test('should return private recipe when accessed without authentication (for testing)', async () => {
      const response = await request(app)
        .get(`/recipes/${privateRecipe._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Recipe retrieved successfully');
      expect(response.body.recipe).toHaveProperty('title', 'Private Recipe');
      expect(response.body.recipe).toHaveProperty('isPublic', false);
    });

    test('should return 404 for non-existent recipe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/recipes/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Recipe not found');
    });

    test('should return 500 for invalid recipe ID format', async () => {
      const response = await request(app)
        .get('/recipes/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve recipe');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.recipes, 'findById').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get(`/recipes/${testRecipe1._id}`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve recipe');

      // Restore the original method
      db.recipes.findById.mockRestore();
    });
  });

  describe('GET /recipes/user - getUserRecipes', () => {
    test('should return all user recipes (both public and private)', async () => {
      const response = await request(app)
        .get('/recipes/user')
        .set('testuserid', testUser._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User recipes retrieved successfully');
      expect(response.body).toHaveProperty('count', 3); // 2 public + 1 private
      expect(response.body).toHaveProperty('recipes');
      expect(response.body.recipes).toHaveLength(3);

      // Check if all recipes are returned (both public and private)
      const recipeIds = response.body.recipes.map(recipe => recipe._id);
      expect(recipeIds).toContain(testRecipe1._id.toString());
      expect(recipeIds).toContain(testRecipe2._id.toString());
      expect(recipeIds).toContain(privateRecipe._id.toString());
    });

    test('should return recipes with populated creator information', async () => {
      const response = await request(app)
        .get('/recipes/user')
        .set('testuserid', testUser._id.toString())
        .expect(200);

      const recipe = response.body.recipes[0];
      expect(recipe).toHaveProperty('creatorId');
      expect(recipe.creatorId).toHaveProperty('displayName', 'Test User');
      expect(recipe.creatorId).toHaveProperty('firstName', 'Test');
      expect(recipe.creatorId).toHaveProperty('lastName', 'User');
    });

    test('should return recipes sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get('/recipes/user')
        .set('testuserid', testUser._id.toString())
        .expect(200);

      const recipes = response.body.recipes;
      if (recipes.length > 1) {
        const firstRecipeDate = new Date(recipes[0].createdAt);
        const secondRecipeDate = new Date(recipes[1].createdAt);
        expect(firstRecipeDate.getTime()).toBeGreaterThanOrEqual(secondRecipeDate.getTime());
      }
    });

    test('should return empty array when user has no recipes', async () => {
      // Delete all recipes for the user
      await db.recipes.deleteMany({ creatorId: testUser._id });

      const response = await request(app)
        .get('/recipes/user')
        .set('testuserid', testUser._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User recipes retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.recipes).toHaveLength(0);
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.recipes, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get('/recipes/user')
        .set('testuserid', testUser._id.toString())
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve user recipes');

      // Restore the original method
      db.recipes.find.mockRestore();
    });
  });
}); 