const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../models');
const User = db.users;

module.exports = function(passport) {
  // Check if Google OAuth environment variables are set
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  if (!googleClientId || !googleClientSecret) {
    console.warn('⚠️  Google OAuth not configured:');
    console.warn('   - GOOGLE_CLIENT_ID:', googleClientId ? 'Set' : 'NOT SET');
    console.warn('   - GOOGLE_CLIENT_SECRET:', googleClientSecret ? 'Set' : 'NOT SET');
    console.warn('   - Authentication will work with test tokens only');
    console.warn('   - Set up Google OAuth credentials in .env file for full functionality');
    
    // Set up minimal passport configuration for testing
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (error) {
        console.error('Error deserializing user:', error);
        done(error, null);
      }
    });
    
    return; // Exit early if OAuth not configured
  }

  // Google OAuth Strategy (only if environment variables are present)
  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
    callbackURL: googleCallbackUrl
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists in our database
      let user = await User.findOne({ oauthId: profile.id });

      if (user) {
        // User exists, update their information
        user.displayName = profile.displayName;
        user.firstName = profile.name.givenName;
        user.lastName = profile.name.familyName;
        user.email = profile.emails[0].value;
        user.profileImageUrl = profile.photos[0].value;
        await user.save();
        return done(null, user);
      } else {
        // Create new user
        user = new User({
          oauthId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          profileImageUrl: profile.photos[0].value
        });
        await user.save();
        return done(null, user);
      }
    } catch (error) {
      console.error('Error in Google OAuth strategy:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      console.error('Error deserializing user:', error);
      done(error, null);
    }
  });

  console.log('✅ Google OAuth configured successfully');
}; 