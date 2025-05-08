const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
  passReqToCallback: true
},
async (req, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ 
      $or: [
        { googleId: profile.id },
        { email: profile.emails[0].value }
      ]
    });

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        userName: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0]?.value,
        password: null
      });
    }
    else if (!user.googleId) {
      user.googleId = profile.id;
      await user.save();
    }

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}
));