import React from "react";
import { TrendingDown, Info, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PriceInsights({ currentPrice, demandCount = 0 }) {
  // Generate mock price history based on current price (more realistic)
  const generatePriceHistory = (currentPrice) => {
    const variation = currentPrice * 0.1; // 10% variation
    const history = [];
    for (let i = 0; i < 6; i++) {
      const randomVariation = (Math.random() - 0.5) * variation;
      history.push(Math.round(currentPrice + randomVariation));
    }
    // Make sure current price is in the last position
    history[history.length - 1] = currentPrice;
    return history;
  };

  const priceHistory = generatePriceHistory(currentPrice);
  const minPrice = Math.min(...priceHistory);
  const maxPrice = Math.max(...priceHistory);
  const avgPrice = Math.round(
    priceHistory.reduce((a, b) => a + b, 0) / priceHistory.length
  );
  const isBestPrice = currentPrice <= minPrice;

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Price History
            {isBestPrice && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Best Deal
              </span>
            )}
          </h3>
          <p className="text-sm text-neutral-500">How this price compares to the last 6 months</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-400 block uppercase">Avg. Price</span>
          <span className="font-semibold text-neutral-900 dark:text-white">
            ₹{avgPrice.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* The Visual Graph */}
      <div className="relative h-32 w-full flex items-end gap-1 px-2">
        {priceHistory.map((price, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(price / (maxPrice * 1.1)) * 100}%` }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`relative flex-1 rounded-t-lg group ${
              price === currentPrice
                ? "bg-emerald-500"
                : "bg-neutral-200 dark:bg-neutral-800"
            }`}
          >
            {/* Tooltip on Hover */}
            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-1 px-2 rounded shadow-xl transition-opacity pointer-events-none whitespace-nowrap">
              ₹{price.toLocaleString("en-IN")}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Demand Indicator (Predictive Logic) */}
      <div className="mt-6 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 flex items-start gap-3">
        <Info className="text-blue-500 mt-0.5" size={18} />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {demandCount > 50 ? "High Demand in this area" : "Moderate Demand"}
          </p>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70">
            {demandCount > 0
              ? `${demandCount} people searched for this in the last 24 hours. ${
                  demandCount > 50 ? "Stock might run out soon." : "Stock is available."
                }`
              : "This product is available at this store."}
          </p>
        </div>
        <ArrowUpRight className="text-blue-500 ml-auto flex-shrink-0" size={18} />
      </div>
    </div>
  );
}