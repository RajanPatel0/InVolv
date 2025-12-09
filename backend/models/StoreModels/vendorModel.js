import mongoose from "mongoose";

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
    storeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim:true },
    phone: { type: String, required: true, unique: true, trim:true }, 
    password: { type: String, required: true, trim:true },
    address: { type: String, required: true, trim:true },
    category: { type: String, required:true, trim:true },
    location: { type: pointSchema, required: true, trim:true },
    isVerified: { type: Boolean, default: false},
    otp: { type: String, default: null},  //hashed otp
    otpExpiresAt: { type: Date, default: null},
    createdAt: { type: Date, default: Date.now }
},{ timestamps: true });

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;