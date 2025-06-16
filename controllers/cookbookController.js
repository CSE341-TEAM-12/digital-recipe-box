const db = require('../models');

// Create a new cookbook
const createCookbook = async (req, res) => {
  try {
    const cookbookData = {
      ...req.body,
      ownerId: req.user.id // From authentication middleware
    };

    const cookbook = new db.Cookbook(cookbookData);
    const savedCookbook = await cookbook.save();

    // Populate owner and recipe information
    const populatedCookbook = await db.Cookbook.findById(savedCookbook._id)
      .populate('ownerId', 'displayName firstName lastName')
      .populate('recipeIds', 'title description isPublic');

    res.status(201).json({
      message: 'Cookbook created successfully',
      cookbook: populatedCookbook
    });
  } catch (error) {
    console.error('Error creating cookbook:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create cookbook'
    });
  }
};

// Get all cookbooks owned by the logged-in user
const getUserCookbooks = async (req, res) => {
  try {
    const cookbooks = await db.Cookbook.find({ ownerId: req.user.id })
      .populate('ownerId', 'displayName firstName lastName')
      .populate('recipeIds', 'title description isPublic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'User cookbooks retrieved successfully',
      count: cookbooks.length,
      cookbooks
    });
  } catch (error) {
    console.error('Error fetching user cookbooks:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve cookbooks'
    });
  }
};

// Get a single cookbook by ID
const getCookbookById = async (req, res) => {
  try {
    const cookbook = await db.Cookbook.findById(req.params.id)
      .populate('ownerId', 'displayName firstName lastName')
      .populate('recipeIds', 'title description isPublic creatorId');

    if (!cookbook) {
      return res.status(404).json({
        error: 'Cookbook not found'
      });
    }

    // Check if user is the owner
    if (cookbook.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied. You can only access your own cookbooks.'
      });
    }

    res.status(200).json({
      message: 'Cookbook retrieved successfully',
      cookbook
    });
  } catch (error) {
    console.error('Error fetching cookbook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve cookbook'
    });
  }
};

module.exports = {
  createCookbook,
  getUserCookbooks,
  getCookbookById
}; 