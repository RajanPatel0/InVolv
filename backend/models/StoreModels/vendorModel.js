import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    storeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim:true },
    phone: { type: String, required: true, unique: true, trim:true }, 
    password: { type: String, required: true, trim:true },
    address: { type: String, required: true, trim:true },
    category: { type: String, required:true, trim:true },
    location: {   type: String, required: true, trim:true },
    createdAt: { type: Date, default: Date.now }
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;