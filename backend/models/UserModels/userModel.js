import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim:true,  },
    phone: { type: String, sparse: true, trim:true }, // Made optional for OAuth users
    password: { type: String, sparse: true, trim:true }, // Made optional for OAuth users
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null},  //hashed otp
    otpExpiresAt: { type: Date, default: null},
    googleId: { type: String, default: null, sparse: true }, // Google OAuth ID
    isGoogleAccount: { type: Boolean, default: false },
    fcmToken: {
        type: String,
        default: null,
        sparse: true, // Allows multiple null values
    },
    refreshTokens: [String], // Store multiple refresh tokens for the user
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if(this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("otp") && this.otp && !this.otp.startsWith("$2b$")) {
    this.otp = await bcrypt.hash(this.otp.toString(), 10);
  }
  next;
}); 

const User = mongoose.model("User", userSchema);
export default User