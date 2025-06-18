const request = require('supertest');
const express = require('express');
const db = require('../models');
const reviewController = require('../controllers/reviewController');

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
const mockAuth = (req, res, next) => {
  if (req.headers.noauth) {
    req.user = null;
  } else {
    req.user = {
      _id: req.headers.testuserid || '507f1f77bcf86cd799439011',
      oauthId: '123456789',
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      profileImageUrl: 'https://example.com/profile.jpg'
    };
  }
  next();
};

// Set up routes
app.get('/reviews/recipe/:recipeId', mockAuth, reviewController.getReviewsByRecipeId);
app.get('/reviews/user', mockAuth, reviewController.getUserReviews);
app.get('/reviews/:id', mockAuth, reviewController.getReviewById);

describe('Review Controller - GET Endpoints', () => {
  let testUser1, testUser2, testRecipe1, testRecipe2, privateRecipe, testReview1, testReview2, testReview3;

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
      creatorId: testUser1._id
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
      creatorId: testUser2._id
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
      creatorId: testUser1._id
    });
    await privateRecipe.save();

    // Create test reviews
    testReview1 = new db.reviews({
      rating: 5,
      comment: 'Excellent recipe!',
      reviewerId: testUser1._id,
      recipeId: testRecipe1._id
    });
    await testReview1.save();

    testReview2 = new db.reviews({
      rating: 4,
      comment: 'Very good, but could use more salt',
      reviewerId: testUser2._id,
      recipeId: testRecipe1._id
    });
    await testReview2.save();

    testReview3 = new db.reviews({
      rating: 3,
      comment: 'Average recipe',
      reviewerId: testUser1._id,
      recipeId: testRecipe2._id
    });
    await testReview3.save();
  });

  describe('GET /reviews/recipe/:recipeId - getReviewsByRecipeId', () => {
    test('should return all reviews for a public recipe successfully', async () => {
      const response = await request(app)
        .get(`/reviews/recipe/${testRecipe1._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Reviews retrieved successfully');
      expect(response.body).toHaveProperty('recipeId', testRecipe1._id.toString());
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('averageRating', 4.5);
      expect(response.body).toHaveProperty('reviews');
      expect(response.body.reviews).toHaveLength(2);

      // Check if reviews belong to the recipe
      const reviewIds = response.body.reviews.map(review => review._id);
      expect(reviewIds).toContain(testReview1._id.toString());
      expect(reviewIds).toContain(testReview2._id.toString());
    });

    test('should return reviews with populated reviewer information', async () => {
      const response = await request(app)
        .get(`/reviews/recipe/${testRecipe1._id}`)
        .expect(200);

      const review = response.body.reviews[0];
      expect(review).toHaveProperty('reviewerId');
      expect(review.reviewerId).toHaveProperty('displayName');
      expect(review.reviewerId).toHaveProperty('firstName');
      expect(review.reviewerId).toHaveProperty('lastName');
    });

    test('should return reviews sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get(`/reviews/recipe/${testRecipe1._id}`)
        .expect(200);

      const reviews = response.body.reviews;
      if (reviews.length > 1) {
        const firstReviewDate = new Date(reviews[0].createdAt);
        const secondReviewDate = new Date(reviews[1].createdAt);
        expect(firstReviewDate.getTime()).toBeGreaterThanOrEqual(secondReviewDate.getTime());
      }
    });

    test('should calculate correct average rating', async () => {
      const response = await request(app)
        .get(`/reviews/recipe/${testRecipe1._id}`)
        .expect(200);

      // testReview1 has rating 5, testReview2 has rating 4
      // Average should be (5 + 4) / 2 = 4.5
      expect(response.body.averageRating).toBe(4.5);
    });

    test('should return empty array when recipe has no reviews', async () => {
              // Create a recipe with no reviews
        const noReviewRecipe = new db.recipes({
          title: 'No Review Recipe',
          description: 'A recipe with no reviews',
          ingredients: [{ name: 'ingredient', quantity: '1 cup' }],
          instructions: ['step'],
          prepTimeMinutes: 5,
          cookTimeMinutes: 10,
          servings: 1,
          isPublic: true,
          creatorId: testUser1._id
        });
      await noReviewRecipe.save();

      const response = await request(app)
        .get(`/reviews/recipe/${noReviewRecipe._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Reviews retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('averageRating', 0);
      expect(response.body.reviews).toHaveLength(0);
    });

    test('should return 404 for non-existent recipe', async () => {
      const nonExistentId = '507f1f77bcf86cd799439012';
      
      const response = await request(app)
        .get(`/reviews/recipe/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Recipe not found');
    });

    test('should handle private recipe access without authentication (for testing)', async () => {
      const response = await request(app)
        .get(`/reviews/recipe/${privateRecipe._id}`)
        .set('noauth', 'true')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Reviews retrieved successfully');
    });

    test('should return 500 for invalid recipe ID format', async () => {
      const response = await request(app)
        .get('/reviews/recipe/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve reviews');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.recipes, 'findById').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get(`/reviews/recipe/${testRecipe1._id}`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve reviews');

      // Restore the original method
      db.recipes.findById.mockRestore();
    });
  });

  describe('GET /reviews/:id - getReviewById', () => {
    test('should return review by ID successfully', async () => {
      const response = await request(app)
        .get(`/reviews/${testReview1._id}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Review retrieved successfully');
      expect(response.body).toHaveProperty('review');
      expect(response.body.review).toHaveProperty('_id', testReview1._id.toString());
      expect(response.body.review).toHaveProperty('rating', 5);
      expect(response.body.review).toHaveProperty('comment', 'Excellent recipe!');
    });

    test('should return review with populated reviewer information', async () => {
      const response = await request(app)
        .get(`/reviews/${testReview1._id}`)
        .expect(200);

      const review = response.body.review;
      expect(review).toHaveProperty('reviewerId');
      expect(review.reviewerId).toHaveProperty('displayName', 'Test User 1');
      expect(review.reviewerId).toHaveProperty('firstName', 'Test');
      expect(review.reviewerId).toHaveProperty('lastName', 'User1');
    });

    test('should return review with populated recipe information', async () => {
      const response = await request(app)
        .get(`/reviews/${testReview1._id}`)
        .expect(200);

      const review = response.body.review;
      expect(review).toHaveProperty('recipeId');
      expect(review.recipeId).toHaveProperty('title', 'Public Recipe 1');
      expect(review.recipeId).toHaveProperty('description', 'A delicious public recipe');
    });

    test('should return 404 for non-existent review', async () => {
      const nonExistentId = '507f1f77bcf86cd799439012';
      
      const response = await request(app)
        .get(`/reviews/${nonExistentId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Review not found');
    });

    test('should return 500 for invalid review ID format', async () => {
      const response = await request(app)
        .get('/reviews/invalid-id')
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve review');
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.reviews, 'findById').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get(`/reviews/${testReview1._id}`)
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve review');

      // Restore the original method
      db.reviews.findById.mockRestore();
    });

    test('should include all review fields in response', async () => {
      const response = await request(app)
        .get(`/reviews/${testReview1._id}`)
        .expect(200);

      const review = response.body.review;
      expect(review).toHaveProperty('_id');
      expect(review).toHaveProperty('rating');
      expect(review).toHaveProperty('comment');
      expect(review).toHaveProperty('reviewerId');
      expect(review).toHaveProperty('recipeId');
      expect(review).toHaveProperty('createdAt');
      expect(review).toHaveProperty('updatedAt');
    });
  });

  describe('GET /reviews/user - getUserReviews', () => {
    test('should return all reviews by the authenticated user', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User reviews retrieved successfully');
      expect(response.body).toHaveProperty('count', 2); // testReview1 and testReview3
      expect(response.body).toHaveProperty('reviews');
      expect(response.body.reviews).toHaveLength(2);

      // Check if reviews belong to the user
      const reviewIds = response.body.reviews.map(review => review._id);
      expect(reviewIds).toContain(testReview1._id.toString());
      expect(reviewIds).toContain(testReview3._id.toString());
      expect(reviewIds).not.toContain(testReview2._id.toString());
    });

    test('should return reviews with populated reviewer information', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const review = response.body.reviews[0];
      expect(review).toHaveProperty('reviewerId');
      expect(review.reviewerId).toHaveProperty('displayName');
      expect(review.reviewerId).toHaveProperty('firstName');
      expect(review.reviewerId).toHaveProperty('lastName');
    });

    test('should return reviews with populated recipe information', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const review = response.body.reviews[0];
      expect(review).toHaveProperty('recipeId');
      expect(review.recipeId).toHaveProperty('title');
      expect(review.recipeId).toHaveProperty('description');
    });

    test('should return reviews sorted by creation date (newest first)', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      const reviews = response.body.reviews;
      if (reviews.length > 1) {
        const firstReviewDate = new Date(reviews[0].createdAt);
        const secondReviewDate = new Date(reviews[1].createdAt);
        expect(firstReviewDate.getTime()).toBeGreaterThanOrEqual(secondReviewDate.getTime());
      }
    });

    test('should return empty array when user has no reviews', async () => {
      // Create a new user with no reviews
      const newUser = new db.users({
        oauthId: '555555555',
        displayName: 'New User',
        firstName: 'New',
        lastName: 'User',
        email: 'new@example.com',
        profileImageUrl: 'https://example.com/new.jpg'
      });
      await newUser.save();

      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', newUser._id.toString())
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User reviews retrieved successfully');
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body.reviews).toHaveLength(0);
    });

    test('should only return reviews created by the authenticated user', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(200);

      response.body.reviews.forEach(review => {
        expect(review.reviewerId._id).toBe(testUser1._id.toString());
      });
    });

    test('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(db.reviews, 'find').mockImplementationOnce(() => {
        throw new Error('Database connection error');
      });

      const response = await request(app)
        .get('/reviews/user')
        .set('testuserid', testUser1._id.toString())
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('message', 'Failed to retrieve user reviews');

      // Restore the original method
      db.reviews.find.mockRestore();
    });

    test('should work with fallback user ID when no authentication', async () => {
      const response = await request(app)
        .get('/reviews/user')
        .set('noauth', 'true')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User reviews retrieved successfully');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('reviews');
    });
  });
}); 