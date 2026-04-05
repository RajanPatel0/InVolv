import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/StoreModels/productModel.js";
import PriceHistory from "../models/StoreModels/priceHistoryModel.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const products = await Product.find({}).limit(20);

for (const p of products) {
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    // Simulate slight price fluctuation ±5%
    const fluctuation = 1 + (Math.random() - 0.5) * 0.1;
    await PriceHistory.create({
      productId: p._id,
      vendorId: p.vendorId,
      price: Math.round(p.price * fluctuation),
      stock: p.stock,
      recordedAt: date,
    });
  }
}
console.log("Seeded price history");
process.exit(0);