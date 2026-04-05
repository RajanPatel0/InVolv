import mongoose from "mongoose";

const vendorInsightSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  date:     { type: Date, required: true },

  totals: {
    searches:     { type: Number, default: 0 },
    views:        { type: Number, default: 0 },
    reservations: { type: Number, default: 0 },
    uniqueUsers:  { type: Number, default: 0 },
  },

  // Top products ranked by demand score
  topProducts: [{
    productId:    mongoose.Schema.Types.ObjectId,
    pdtName:      String,
    searchVolume: Number,
    viewCount:    Number,
    reservations: Number,
    currentStock: Number,
    currentPrice: Number,
    demandScore:  Number,   // weighted: views*0.3 + reserves*0.7
    alert: String,          // "LOW_STOCK", "HIGH_DEMAND", "TRENDING" or null
  }],

  // 7-day prediction (simple moving average)
  forecast: {
    avgDailySearches:     Number,
    avgDailyReservations: Number,
    trendingProductIds:   [mongoose.Schema.Types.ObjectId],
    recommendations:      [String],
  },

}, { timestamps: true });

vendorInsightSchema.index({ vendorId: 1, date: -1 });

export default mongoose.model("VendorInsight", vendorInsightSchema);