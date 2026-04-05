import mongoose from "mongoose";

/**
 * Real-time metrics collected throughout the day
 * Updates every time a user searches, views, or creates intent
 * Used for real-time dashboard + comparison calculations
 */
const analyticsMetricsSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
    index: true
  },
  date: {
    type: Date,
    default: () => new Date().setHours(0, 0, 0, 0),
    index: true
  },

  // Real-time counters (update immediately as events happen)
  metrics: {
    searches: { type: Number, default: 0 },              // Total searches in vendor's area
    productClicks: { type: Number, default: 0 },         // Views on products
    reserves: { type: Number, default: 0 },              // Reserve intents
    priceAlerts: { type: Number, default: 0 },           // Price drop alerts set
    stockAlerts: { type: Number, default: 0 },           // Stock change alerts set
  },

  // User tracking for unique counts
  uniqueUsers: {
    searched: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // Users who searched
    viewed: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],    // Users who viewed products
    reserved: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // Users who reserved
  },

  // Hourly breakdown (for trend analysis)
  hourlyBreakdown: [{
    hour: { type: Number, min: 0, max: 23 },         // 0-23
    searches: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    reserves: { type: Number, default: 0 },
  }],

  // Per-product metrics (top 30)
  productMetrics: [{
    productId: mongoose.Schema.Types.ObjectId,
    pdtName: String,
    searches: Number,                                 // How many times searched
    views: Number,                                    // How many times viewed
    reserves: Number,                                 // Reservations
    currentStock: Number,
    currentPrice: Number,
    searchToReserveConversion: Number,               // % of searchers who eventually reserved
  }],

  // Calculated fields
  calculated: {
    searchToViewConversion: Number,                  // clicks / searches %
    viewToReserveConversion: Number,                 // reserves / clicks %
    overallConversion: Number,                       // reserves / searches %
    avgProductsPerSearch: Number,                   // Total views / total searches
    uniqueSearches: Number,                          // Distinct visitors searching
    uniqueReservers: Number,                         // Distinct visitors reserving
  },

  // Last updated timestamp
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
analyticsMetricsSchema.index({ vendorId: 1, date: -1 });
analyticsMetricsSchema.index({ date: -1 });
analyticsMetricsSchema.index({ "uniqueUsers.searched": 1 });
analyticsMetricsSchema.index({ "productMetrics.productId": 1 });

export default mongoose.model("AnalyticsMetrics", analyticsMetricsSchema);
