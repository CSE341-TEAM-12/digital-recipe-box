const request = require('supertest');
const express = require('express');
const db = require('../models');
const userController = require('../controllers/userController');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
const mockAuth = (req, res, next) => {
  req.user = {
    _id: req.testUserId || '507f1f77bcf86cd799439011',
    oauthId: '123456789',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  next();
};

// Set up routes
app.get('/users/me', mockAuth, userController.getCurrentUser);
app.get('/users/:id/recipes', userController.getUserRecipes);

describe('User Controller - GET Endpoints', () => {
  let testUser1, testUser2, testRecipe1, testRecipe2, privateRecipe;

  beforeEach(async () => {
    // Create test users
    testUser1 = new db.users({
      oauthId: '123456789',
      displayName: 'Test User 1',
      firstName: 'Test',
      lastName: 'User1',
      email: 'test1@example.com',
      profileImageUrl: 'https://example.com/profile1.jpg'
    });
    await testUser1.save();

    testUser2 = new db.users({
      oauthId: '987654321',
      displayName: 'Test User 2',
      firstName: 'Test',
      lastName: 'User2',
      email: 'test2@example.com',
      profileImageUrl: 'https://example.com/profile2.jpg'
    });
    await testUser2.save();

    // Create test recipes for user1
    testRecipe1 = new db.recipes({
      title: 'Public Recipe 1',
      description: 'A delicious public recipe by user 1',
      ingredients: [
        { name: 'ingredient 1', quantity: '1 cup' },
        { name: 'ingredient 2', quantity: '2 tbsp' }
      ],
      instructions: ['step 1', 'step 2'],
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      isPublic: true,
      creatorId: testUser1._id
    });
    await testRecipe1.save();

    testRecipe2 = new db.recipes({
      title: 'Public Recipe 2',
      description: 'Another public recipe by user 1',
      ingredients: [
        { name: 'ingredient A', quantity: '3 cups' },
        { name: 'ingredient B', quantity: '1 tsp' }
      ],
      instructions: ['step A', 'step B'],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      isPublic: true,
      creatorId: testUser1._id
    });
    await testRecipe2.save();

    privateRecipe = new db.recipes({
      title: 'Private Recipe',
      description: 'A private recipe by user 1',
      ingredients: [
        { name: 'secret ingredient', quantity: '1 pinch' }
      ],
      instructions: ['secret step'],
      prepTimeMinutes: 5,
      cookTimeMinutes: 10,
      servings: 1,
      isPublic: false,
      creatorId: testUser1._id
    });
    await privateRecipe.save();
  });

  describe('GET /users/me - getCurrentUser', () => {
    test('should return current user profile successfully', async () => {
      const response = await request(app)
        .get('/users/me')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User profile retrieved successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('displayName', 'Test User');
      expect(response.body.user).toHaveProperty('firstName', 'Test');
      expect(response.body.user).toHaveProperty('lastName', 'User');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('profileImageUrl', 'https://example.com/profile.jpg');
      expect(response.body.user).toHaveProperty('oauthId', '123456789');
    });

    test('should include all required user fields', async () => {
      const response = await request(app)
        .get('/users/me')
        .expect(200);

      const user = response.body.user;
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('oauthId');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('profileImageUrl');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });

    test('should return 401 when user is not authenticated', async () => {
      // Create app without auth middleware
      const noAuthApp = express();
      noAuthApp.use(express.json());
      noAuthApp.get('/users/me', userController.getCurrentUser);

      const response = await request(noAuthApp)
        .get('/users/me')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Authentication required');
    });

    test('should handle errors gracefully', async () => {
      // Mock the user object to have a property that will throw when accessed
      const testApp = express();
      testApp.use(express.json());
      testApp.use((req, res, next) => {
        req.user = {
          get _id() { throw new Error('Database connection error'); },
          oauthId: '123456789',
          displayName: 'Test User',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profileImageUrl: 'https://example.com/profile.jpg'
        };
        next();
      });
      testApp.get('/users/me', userController.getCurrentUser);

      const response = await request(testApp)
        .get('/users/me')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve user profile');
      expect(response.body).toHaveProperty('details', 'Database connection error');
    });
  });

  describe('GET /users/:id/recipes - getUserRecipes', () => {
    test('should return all public recipes for a valid user', async () => {
      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User recipes retrieved successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', testUser1._id.toString());
      expect(response.body.user).toHaveProperty('displayName', 'Test User 1');
      expect(response.body).toHaveProperty('count', 2); // Only public recipes
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
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      const recipe = response.body.recipes[0];
      expect(recipe).toHaveProperty('creatorId');
      expect(recipe.creatorId).toHaveProperty('displayName', 'Test User 1');
    });

    test('should return recipes sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      const recipes = response.body.recipes;
      if (recipes.length > 1) {
        const firstRecipeDate = new Date(recipes[0].createdAt);
        const secondRecipeDate = new Date(recipes[1].createdAt);
        expect(firstRecipeDate.getTime()).toBeGreaterThanOrEqual(secondRecipeDate.getTime());
      }
    });

    test('should return empty array when user has no public recipes', async () => {
      const response = await request(app)
        .get(`/users/${testUser2._id}/recipes`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User recipes retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.recipes).toHaveLength(0);
    });

    test('should return 404 for non-existent user', async () => {
      const nonExistentId = '507f1f77bcf86cd799439012';
      
      const response = await request(app)
        .get(`/users/${nonExistentId}/recipes`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    test('should return 500 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/users/invalid-id/recipes')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve user recipes');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error for User.findById
      jest.spyOn(db.users, 'findById').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve user recipes');
      expect(response.body).toHaveProperty('details', 'Database connection error');

      // Restore the original method
      db.users.findById.mockRestore();
    });

    test('should handle recipe query errors gracefully', async () => {
      // Mock database error for Recipe.find
      jest.spyOn(db.recipes, 'find').mockImplementationOnce(() => {
        throw new Error('Recipe query error');
      });

      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to retrieve user recipes');
      expect(response.body).toHaveProperty('details', 'Recipe query error');

      // Restore the original method
      db.recipes.find.mockRestore();
    });

    test('should include user information in response', async () => {
      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      expect(response.body.user).toEqual({
        _id: testUser1._id.toString(),
        displayName: testUser1.displayName
      });
    });

    test('should only return recipes where isPublic is true', async () => {
      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      response.body.recipes.forEach(recipe => {
        expect(recipe.isPublic).toBe(true);
      });
    });

    test('should only return recipes created by the specified user', async () => {
      const response = await request(app)
        .get(`/users/${testUser1._id}/recipes`)
        .expect(200);

      response.body.recipes.forEach(recipe => {
        expect(recipe.creatorId._id).toBe(testUser1._id.toString());
      });
    });
  });
}); 