const { body, param, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Recipe validation rules
const validateRecipe = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  
  body('ingredients.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
  
  body('ingredients.*.quantity')
    .trim()
    .notEmpty()
    .withMessage('Ingredient quantity is required'),
  
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
  
  body('instructions.*')
    .trim()
    .notEmpty()
    .withMessage('Instructions cannot be empty'),
  
  body('prepTimeMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Prep time must be a positive number'),
  
  body('cookTimeMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cook time must be a positive number'),
  
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Cookbook validation rules
const validateCookbook = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('recipeIds')
    .optional()
    .isArray()
    .withMessage('Recipe IDs must be an array'),
  
  body('recipeIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each recipe ID must be a valid MongoDB ObjectId'),
  
  handleValidationErrors
];

// Review validation rules
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  
  handleValidationErrors
];

// Validate MongoDB ObjectId parameters
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  
  handleValidationErrors
];

const validateRecipeId = [
  param('recipeId')
    .isMongoId()
    .withMessage('Invalid recipe ID format'),
  
  handleValidationErrors
];

module.exports = {
  validateRecipe,
  validateCookbook,
  validateReview,
  validateObjectId,
  validateRecipeId,
  handleValidationErrors
}; 