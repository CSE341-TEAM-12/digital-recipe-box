const router = require('express').Router();
const passport = require('passport');
const { ensureLoggedOut } = require('../middleware/auth');

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Initiate Google OAuth login'
// #swagger.description = 'Redirects user to Google OAuth consent screen to begin authentication process'
router.get('/google', ensureLoggedOut, passport.authenticate('google', {
  scope: ['profile', 'email']
}));
/* #swagger.responses[302] = {
    description: 'Redirect to Google OAuth consent screen'
} */
/* #swagger.responses[400] = {
    description: 'User is already logged in',
    schema: { $ref: '#/definitions/Error' }
} */

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Google OAuth callback'
// #swagger.description = 'Handles the callback from Google OAuth and completes the authentication process'
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/auth/login/failed',
    successRedirect: '/auth/login/success'
  })
);
/* #swagger.responses[302] = {
    description: 'Redirect to success or failure page after authentication'
} */

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Authentication success'
// #swagger.description = 'Endpoint hit after successful Google OAuth authentication'
router.get('/login/success', (req, res) => {
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

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Authentication failure'
// #swagger.description = 'Endpoint hit after failed Google OAuth authentication'
router.get('/login/failed', (req, res) => {
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

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Logout user'
// #swagger.description = 'Logs out the currently authenticated user and destroys the session'
router.get('/logout', (req, res) => {
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

// #swagger.tags = ['Authentication']
// #swagger.summary = 'Check authentication status'
// #swagger.description = 'Check if the current user is authenticated and return their basic information'
router.get('/status', (req, res) => {
  if (req.user) {
    res.status(200).json({
      authenticated: true,
      user: {
        _id: req.user._id,
        displayName: req.user.displayName,
        email: req.user.email,
        profileImageUrl: req.user.profileImageUrl
      }
    });
  } else {
    res.status(200).json({
      authenticated: false,
      message: 'User not authenticated',
      loginUrl: '/auth/google'
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
            loginUrl: { type: 'string', example: '/auth/google' }
        }
    }
} */

module.exports = router;
