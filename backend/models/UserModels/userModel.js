import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim:true,  },
    phone: { type: String, required: true, unique: true, trim:true },
    password: { type: String, required: true, trim:true },
    otp: { type: String, default: null},  //hashed otp
    otpExpiresAt: { type: Date, default: null},
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
export default User;