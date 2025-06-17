// Authentication middleware for Google OAuth
// This middleware checks if user is authenticated via Google OAuth session

const authenticateUser = (req, res, next) => {
  // Check if user is authenticated via passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    // User is authenticated via OAuth session
    return next();
  }

  // Check for development/testing purposes - allow Bearer token for API testing
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For testing purposes only - remove in production
    if (token === 'test-token' && process.env.NODE_ENV !== 'production') {
      // Simulated user for testing
      req.user = {
        _id: '507f1f77bcf86cd799439011', // Mock ObjectId
        oauthId: 'test-oauth-id',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        profileImageUrl: 'https://via.placeholder.com/150'
      };
      return next();
    }
  }

  // User is not authenticated
  return res.status(401).json({ 
    error: 'Authentication required. Please log in with Google.',
    loginUrl: '/auth/google'
  });
};

// Middleware to ensure user is logged out
const ensureLoggedOut = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.status(400).json({
      error: 'User is already logged in',
      user: {
        displayName: req.user.displayName,
        email: req.user.email
      }
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  ensureLoggedOut
}; 