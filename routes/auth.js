const router = require('express').Router();
const passport = require('passport');
const { ensureLoggedOut } = require('../middleware/auth');

// Helper function to check if Google OAuth is configured
const isGoogleOAuthConfigured = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

router.get('/google', ensureLoggedOut, (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Initiate Google OAuth login'
  // #swagger.description = 'Redirects user to Google OAuth consent screen to begin authentication process'
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables',
      instructions: 'For testing purposes, use Bearer token "test-token" in Authorization header'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
/* #swagger.responses[302] = {
    description: 'Redirect to Google OAuth consent screen'
} */
/* #swagger.responses[400] = {
    description: 'User is already logged in',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[503] = {
    description: 'Google OAuth not configured',
    schema: { $ref: '#/definitions/Error' }
} */

router.get('/google/callback', (req, res, next) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Google OAuth callback'
  // #swagger.description = 'Handles the callback from Google OAuth and completes the authentication process'
  if (!isGoogleOAuthConfigured()) {
    return res.status(503).json({
      error: 'Google OAuth not configured',
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables'
    });
  }
  passport.authenticate('google', { 
    failureRedirect: '/auth/login/failed',
    successRedirect: '/auth/login/success'
  })(req, res, next);
});
/* #swagger.responses[302] = {
    description: 'Redirect to success or failure page after authentication'
} */
/* #swagger.responses[503] = {
    description: 'Google OAuth not configured',
    schema: { $ref: '#/definitions/Error' }
} */

router.get('/login/success', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Authentication success'
  // #swagger.description = 'Endpoint hit after successful Google OAuth authentication'
  if (req.user) {
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user: {
        _id: req.user._id,
        oauthId: req.user.oauthId,
        displayName: req.user.displayName,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        profileImageUrl: req.user.profileImageUrl
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});
/* #swagger.responses[200] = {
    description: 'Authentication successful',
    schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Authentication successful' },
            user: { $ref: '#/definitions/User' }
        }
    }
} */
/* #swagger.responses[401] = {
    description: 'Authentication failed',
    schema: { $ref: '#/definitions/Error' }
} */

router.get('/login/failed', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Authentication failure'
  // #swagger.description = 'Endpoint hit after failed Google OAuth authentication'
  res.status(401).json({
    success: false,
    message: 'Authentication failed. Please try again.',
    loginUrl: '/auth/google'
  });
});
/* #swagger.responses[401] = {
    description: 'Authentication failed',
    schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Authentication failed. Please try again.' },
            loginUrl: { type: 'string', example: '/auth/google' }
        }
    }
} */

router.get('/logout', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Logout user'
  // #swagger.description = 'Logs out the currently authenticated user and destroys the session'
  if (req.user) {
    const userName = req.user.displayName;
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out',
          error: err.message
        });
      }
      res.status(200).json({
        success: true,
        message: `Successfully logged out ${userName}`
      });
    });
  } else {
    res.status(400).json({
      success: false,
      message: 'No user is currently logged in'
    });
  }
});
/* #swagger.responses[200] = {
    description: 'Successfully logged out',
    schema: {
        type: 'object',
        properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Successfully logged out John Doe' }
        }
    }
} */
/* #swagger.responses[400] = {
    description: 'No user logged in',
    schema: { $ref: '#/definitions/Error' }
} */
/* #swagger.responses[500] = {
    description: 'Error during logout',
    schema: { $ref: '#/definitions/Error' }
} */

router.get('/status', (req, res) => {
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Check authentication status'
  // #swagger.description = 'Check if the current user is authenticated and return their basic information'
  const oauthConfigured = isGoogleOAuthConfigured();
  
  if (req.user) {
    res.status(200).json({
      authenticated: true,
      user: {
        _id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        profileImageUrl: req.user.profileImageUrl
      },
      oauthConfigured
    });
  } else {
    res.status(200).json({
      authenticated: false,
      message: 'User not authenticated',
      loginUrl: oauthConfigured ? '/auth/google' : 'Google OAuth not configured',
      oauthConfigured,
      testMode: !oauthConfigured ? 'Use Bearer token "test-token" for testing' : undefined
    });
  }
});
/* #swagger.responses[200] = {
    description: 'Authentication status retrieved',
    schema: {
        type: 'object',
        properties: {
            authenticated: { type: 'boolean', example: true },
            user: { $ref: '#/definitions/User' },
            message: { type: 'string', example: 'User not authenticated' },
            loginUrl: { type: 'string', example: '/auth/google' },
            oauthConfigured: { type: 'boolean', example: true },
            testMode: { type: 'string', example: 'Use Bearer token "test-token" for testing' }
        }
    }
} */

module.exports = router;
