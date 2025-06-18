const request = require('supertest');
const express = require('express');
const db = require('../models');
const cookbookController = require('../controllers/cookbookController');

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
app.get('/cookbooks', mockAuth, cookbookController.getUserCookbooks);
app.get('/cookbooks/:id', mockAuth, cookbookController.getCookbookById);

describe('Cookbook Controller - GET Endpoints', () => {
  let testUser1, testUser2, testCookbook1, testCookbook2, testRecipe1, testRecipe2;

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

    // Create test recipes
    testRecipe1 = new db.recipes({
      title: 'Recipe 1',
      description: 'Test recipe 1',
      ingredients: [{ name: 'ingredient 1', quantity: '1 cup' }],
      instructions: ['step 1'],
      prepTimeMinutes: 15,
      cookTimeMinutes: 30,
      servings: 4,
      isPublic: true,
      creatorId: testUser1._id
    });
    await testRecipe1.save();

    testRecipe2 = new db.recipes({
      title: 'Recipe 2',
      description: 'Test recipe 2',
      ingredients: [{ name: 'ingredient 2', quantity: '2 tbsp' }],
      instructions: ['step 2'],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      servings: 2,
      isPublic: false,
      creatorId: testUser1._id
    });
    await testRecipe2.save();

    // Create test cookbooks
    testCookbook1 = new db.cookbooks({
      name: 'My First Cookbook',
      description: 'A collection of my favorite recipes',
      ownerId: testUser1._id,
      recipeIds: [testRecipe1._id, testRecipe2._id]
    });
    await testCookbook1.save();

    testCookbook2 = new db.cookbooks({
      name: 'My Second Cookbook',
      description: 'Another cookbook',
      ownerId: testUser1._id,
      recipeIds: [testRecipe1._id]
    });
    await testCookbook2.save();
  });

  describe('GET /cookbooks - getUserCookbooks', () => {
    test('should return all user cookbooks successfully', async () => {
      // Set the test user ID for the mock auth
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User cookbooks retrieved successfully');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('cookbooks');
      expect(response.body.cookbooks).toHaveLength(2);

      // Check if cookbooks belong to the user
      const cookbookIds = response.body.cookbooks.map(cookbook => cookbook._id);
      expect(cookbookIds).toContain(testCookbook1._id.toString());
      expect(cookbookIds).toContain(testCookbook2._id.toString());
    });

    test('should return cookbooks with populated owner information', async () => {
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbook = response.body.cookbooks[0];
      expect(cookbook).toHaveProperty('ownerId');
      expect(cookbook.ownerId).toHaveProperty('displayName', 'Test User 1');
      expect(cookbook.ownerId).toHaveProperty('firstName', 'Test');
      expect(cookbook.ownerId).toHaveProperty('lastName', 'User1');
    });

    test('should return cookbooks with populated recipe information', async () => {
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbook = response.body.cookbooks.find(cb => cb._id === testCookbook1._id.toString());
      expect(cookbook).toHaveProperty('recipeIds');
      expect(cookbook.recipeIds).toHaveLength(2);
      
      const recipe = cookbook.recipeIds[0];
      expect(recipe).toHaveProperty('title');
      expect(recipe).toHaveProperty('description');
      expect(recipe).toHaveProperty('isPublic');
    });

    test('should return cookbooks sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbooks = response.body.cookbooks;
      if (cookbooks.length > 1) {
        const firstCookbookDate = new Date(cookbooks[0].createdAt);
        const secondCookbookDate = new Date(cookbooks[1].createdAt);
        expect(firstCookbookDate.getTime()).toBeGreaterThanOrEqual(secondCookbookDate.getTime());
      }
    });

    test('should return empty array when user has no cookbooks', async () => {
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser2._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User cookbooks retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.cookbooks).toHaveLength(0);
    });

    test('should only return cookbooks owned by the authenticated user', async () => {
      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      response.body.cookbooks.forEach(cookbook => {
        expect(cookbook.ownerId._id).toBe(testUser1._id.toString());
      });
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error using a chainable mock
      const mockFind = {
        populate: jest.fn(() => ({
          populate: jest.fn(() => ({
            sort: jest.fn(() => {
              throw new Error('Database connection error');
            })
          }))
        }))
      };
      
      jest.spyOn(db.cookbooks, 'find').mockImplementationOnce(() => mockFind);

      const response = await request(app)
        .get('/cookbooks')
        .set('testuserid', testUser1._id.toString())
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve cookbooks');

      // Restore the original method
      db.cookbooks.find.mockRestore();
    });
  });

  describe('GET /cookbooks/:id - getCookbookById', () => {
    test('should return cookbook by ID successfully', async () => {
      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cookbook retrieved successfully');
      expect(response.body).toHaveProperty('cookbook');
      expect(response.body).toHaveProperty('isOwner', true);
      expect(response.body.cookbook).toHaveProperty('_id', testCookbook1._id.toString());
      expect(response.body.cookbook).toHaveProperty('name', 'My First Cookbook');
      expect(response.body.cookbook).toHaveProperty('description', 'A collection of my favorite recipes');
    });

    test('should return cookbook with populated owner information', async () => {
      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbook = response.body.cookbook;
      expect(cookbook).toHaveProperty('ownerId');
      expect(cookbook.ownerId).toHaveProperty('displayName', 'Test User 1');
      expect(cookbook.ownerId).toHaveProperty('firstName', 'Test');
      expect(cookbook.ownerId).toHaveProperty('lastName', 'User1');
    });

    test('should return cookbook with populated recipe information', async () => {
      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbook = response.body.cookbook;
      expect(cookbook).toHaveProperty('recipeIds');
      expect(cookbook.recipeIds).toHaveLength(2);
      
      const recipe = cookbook.recipeIds[0];
      expect(recipe).toHaveProperty('title');
      expect(recipe).toHaveProperty('description');
      expect(recipe).toHaveProperty('isPublic');
      expect(recipe).toHaveProperty('creatorId');
    });

    test('should return 404 for non-existent cookbook', async () => {
      const nonExistentId = '507f1f77bcf86cd799439012';
      
      const response = await request(app)
        .get(`/cookbooks/${nonExistentId}`)
        .set('testuserid', testUser1._id.toString())
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cookbook not found');
    });

    test('should return cookbook when accessed by non-owner (public endpoint)', async () => {
      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser2._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cookbook retrieved successfully');
      expect(response.body).toHaveProperty('cookbook');
      expect(response.body).toHaveProperty('isOwner', false);
    });

    test('should return 500 for invalid cookbook ID format', async () => {
      const response = await request(app)
        .get('/cookbooks/invalid-id')
        .set('testuserid', testUser1._id.toString())
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve cookbook');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.cookbooks, 'findById').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve cookbook');

      // Restore the original method
      db.cookbooks.findById.mockRestore();
    });

    test('should include all cookbook fields in response', async () => {
      const response = await request(app)
        .get(`/cookbooks/${testCookbook1._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const cookbook = response.body.cookbook;
      expect(cookbook).toHaveProperty('_id');
      expect(cookbook).toHaveProperty('name');
      expect(cookbook).toHaveProperty('description');
      expect(cookbook).toHaveProperty('ownerId');
      expect(cookbook).toHaveProperty('recipeIds');
      expect(cookbook).toHaveProperty('createdAt');
      expect(cookbook).toHaveProperty('updatedAt');
    });

    test('should indicate ownership status when accessing cookbook', async () => {
      // Create a cookbook owned by user2
      const user2Cookbook = new db.cookbooks({
        name: 'User 2 Cookbook',
        description: 'Owned by user 2',
        ownerId: testUser2._id,
        recipeIds: []
      });
      await user2Cookbook.save();

      // Try to access it with user1 credentials (should work but show isOwner: false)
      const response = await request(app)
        .get(`/cookbooks/${user2Cookbook._id}`)
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cookbook retrieved successfully');
      expect(response.body).toHaveProperty('cookbook');
      expect(response.body).toHaveProperty('isOwner', false);
    });
  });


}); 