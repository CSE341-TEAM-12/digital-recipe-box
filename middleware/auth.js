// Authentication middleware for Google OAuth
// This middleware checks if user is authenticated via Google OAuth session

const authenticateUser = (req, res, next) => {
  // Check if user is authenticated via passport session
  if (req.isAuthenticated && req.isAuthenticated()) {
    // User is authenticated via OAuth session
    return next();
  }

  // User is not authenticated
  return res.status(401).json({ 
    error: 'Authentication required. Please log in with Google.',
    message: 'You must be logged in via Google OAuth to access this resource.',
    loginUrl: '/auth/google',
    instructions: 'Visit /auth/google to initiate the login process'
  });
};

// Middleware to ensure user is logged out
const ensureLoggedOut = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.status(400).json({
      error: 'User is already logged in',
      message: 'You are already authenticated. Please log out first if you want to log in with a different account.',
      user: {
        displayName: req.user.displayName,
        email: req.user.email
      },
      logoutUrl: '/auth/logout'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  ensureLoggedOut
}; 