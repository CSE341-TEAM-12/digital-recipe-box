const db = require('../models');
const User = db.users;
const Recipe = db.recipes;
const mongoose = require('mongoose');

// @desc    Get all users
// @route   GET /users
// @access  Public
const getAllUsers = async (req, res) => {
  try {
    // Get all users with limited information for privacy
    const users = await User.find({})
      .select('_id displayName firstName lastName profileImageUrl createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Users retrieved successfully',
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'Failed to retrieve users',
      details: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /users/me
// @access  Protected
const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Return the user data (already populated by passport)
    const user = {
      _id: req.user._id,
      oauthId: req.user.oauthId,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      profileImageUrl: req.user.profileImageUrl,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      error: 'Failed to retrieve user profile',
      details: error.message
    });
  }
};

// @desc    Get all public recipes created by a specific user
// @route   GET /users/:id/recipes
// @access  Public
const getUserRecipes = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get all public recipes created by this user
    const recipes = await Recipe.find({
      creatorId: id,
      isPublic: true
    })
    .populate('creatorId', 'displayName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'User recipes retrieved successfully',
      user: {
        _id: user._id,
        displayName: user.displayName
      },
      count: recipes.length,
      recipes: recipes
    });
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({
      error: 'Failed to retrieve user recipes',
      details: error.message
    });
  }
};

const updateUserProfile = async (req, res) => {
  try{
    const { id } = req.params;
    const {displayName, firstName, lastName, email, profileImageUrl} = req.body;

    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }
    // Find user by ID
    const user  = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    } else {
      // Update user profile
      user.displayName = displayName || user.displayName;
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;

      // Save updated user
      await user.save();

      res.status(200).json({
        message: 'User profile updated successfully',
        user
      });
    }
  }catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Failed to update user profile',
      details: error.message
    });
  }
}

const deleteUserAccount = async (req, res) => {
  try{
    const { id } = req.params;

    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Find user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Delete user account
    await User.findByIdAndDelete(id);

    res.status(200).json({
      message: 'User account deleted successfully'
    });
  }catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({
      error: 'Failed to delete user account',
      details: error.message
    });
  }
}

module.exports = {
  getAllUsers,
  getCurrentUser,
  getUserRecipes,
  updateUserProfile,
  deleteUserAccount
}; 