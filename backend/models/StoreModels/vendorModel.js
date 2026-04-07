import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const vendorSchema = new mongoose.Schema({
    storeName: { type: String, sparse: true, trim: true }, // Made optional for OAuth flow
    email: { type: String, required: true, unique: true, trim:true },
    phone: { type: String, unique: true, sparse: true }, // Made optional
    password: { type: String, sparse: true, trim:true }, // Made optional for OAuth users
    address: { type: String, sparse: true, trim:true }, // Made optional initially
    category: { type: String, sparse: true, trim:true }, // Made optional initially
    location: { type: pointSchema, sparse: true }, // Made optional initially
    isVerified: { type: Boolean, default: false},
    otp: { type: String, default: null},  //hashed otp
    otpExpiresAt: { type: Date, default: null},
    googleId: { type: String, default: null, sparse: true }, // Google OAuth ID
    isGoogleAccount: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false }, // Track if vendor completed setup
    refreshToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
},{ timestamps: true });

vendorSchema.pre('save', async function(next) {
  if(this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified("otp") && this.otp && !this.otp.startsWith("$2b$")) {
    this.otp = await bcrypt.hash(this.otp.toString(), 10);
  }
  next;
}); 

vendorSchema.index({ location: "2dsphere" });

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;