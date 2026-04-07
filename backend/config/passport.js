import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/UserModels/userModel.js';
import Vendor from '../models/StoreModels/vendorModel.js';
import dotenv from 'dotenv';

dotenv.config();

// User Google Strategy
passport.use('google-user', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // Create new user if doesn't exist
        user = new User({
          fullName: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleAccount: true,
          isVerified: true, // Auto-verify for OAuth users
          phone: null, // Can be updated later
          refreshTokens: [], // Initialize empty array
        });
        await user.save();
      } else if (!user.googleId) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.isGoogleAccount = true;
        if (!user.refreshTokens) {
          user.refreshTokens = [];
        }
        await user.save();
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Vendor Google Strategy
passport.use('google-vendor', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.VENDOR_GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if vendor already exists
      let vendor = await Vendor.findOne({ email: profile.emails[0].value });

      if (!vendor) {
        // Create new vendor with partial data for OAuth
        vendor = new Vendor({
          email: profile.emails[0].value,
          googleId: profile.id,
          isGoogleAccount: true,
          isVerified: true, // Auto-verify for OAuth
          isProfileComplete: false, // Vendor needs to complete profile
          storeName: null,
          phone: null,
          refreshToken: null, // Initialize as null
        });
        await vendor.save();
      } else if (!vendor.googleId) {
        // Link Google account to existing vendor
        vendor.googleId = profile.id;
        vendor.isGoogleAccount = true;
        await vendor.save();
      }

      return done(null, vendor);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    // Try to find in User model first
    let user = await User.findById(id);
    if (user) {
      return done(null, user);
    }

    // If not found, try Vendor model
    let vendor = await Vendor.findById(id);
    if (vendor) {
      return done(null, vendor);
    }

    done(null, null);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
