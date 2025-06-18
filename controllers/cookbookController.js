const db = require('../models');

// Create a new cookbook
const createCookbook = async (req, res) => {
  try {
    const cookbookData = {
      ...req.body,
      ownerId: req.user._id // From authentication middleware (Google OAuth)
    };

    const cookbook = new db.cookbooks(cookbookData);
    const savedCookbook = await cookbook.save();

    // Populate owner and recipe information
    const populatedCookbook = await db.cookbooks.findById(savedCookbook._id)
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
    const cookbooks = await db.cookbooks.find({ ownerId: req.user._id })
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
    const cookbook = await db.cookbooks.findById(req.params.id)
      .populate('ownerId', 'displayName firstName lastName')
      .populate('recipeIds', 'title description isPublic creatorId');

    if (!cookbook) {
      return res.status(404).json({
        error: 'Cookbook not found'
      });
    }

    // Check if user is the owner
    if (cookbook.ownerId._id.toString() !== req.user._id.toString()) {
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

const updateCookbook = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the cookbook and check ownership
    const cookbook = await db.cookbooks.findById(id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    if (cookbook.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only update your own cookbooks.' });
    }

    // Update the cookbook
    const updatedCookbook = await db.cookbooks.findByIdAndUpdate(id, updateData, { new: true })
      .populate('ownerId', 'displayName firstName lastName')
      .populate('recipeIds', 'title description isPublic');

    res.status(200).json({
      message: 'Cookbook updated successfully',
      cookbook: updatedCookbook
    });
  } catch (error) {
    console.error('Error updating cookbook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update cookbook'
    });
  }
    
}

const deleteCookbook = async (req, res) => {
  try{
    const { id } = req.params;

    // Find the cookbook and check ownership
    const cookbook = await db.cookbooks.findById(id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }

    if (cookbook.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own cookbooks.' });
    }

    // Delete the cookbook
    await db.cookbooks.findByIdAndDelete(id);

    res.status(200).json({
      message: 'Cookbook deleted successfully'
    });
  }catch (error) {
    console.error('Error deleting cookbook:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete cookbook'
    });
  }
}


module.exports = {
  createCookbook,
  getUserCookbooks,
  getCookbookById,
  updateCookbook,
  deleteCookbook
}; 