import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
  productName: String,
  userLocation: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number]
  },
  area: String,
  searchedAt: { type: Date, default: Date.now }
});

searchLogSchema.index({ productName: 1, area: 1 });

const Search = mongoose.model("Search", searchLogSchema);
export default Search;
