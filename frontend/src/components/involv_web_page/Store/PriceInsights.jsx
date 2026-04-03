import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp, Info, ArrowUpRight, Loader, AlertCircle, BarChart3, Flame, CircleCheckBig, ChartArea } from "lucide-react";
import { motion } from "framer-motion";
import { fetchPriceForecast } from "../../../api/userApi/forecastApis";

export default function PriceInsights({
  currentPrice,
  demandCount = 0,
  productId = null,
  vendorId = null,
  productName = "Product"
}) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId && vendorId) {
      const loadForecast = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await fetchPriceForecast(productId, vendorId);
          if (response.success && response.data) {
            setForecast(response.data);
          } else {
            setError("No forecast data available");
          }
        } catch (err) {
          console.error("Forecast fetch error:", err);
          setError("Unable to load price forecast");
        } finally {
          setLoading(false);
        }
      };
      loadForecast();
    }
  }, [productId, vendorId]);

  // Fallback to mock data if no forecast
  const generateMockHistory = () => {
    const variation = currentPrice * 0.1;
    const history = [];
    for (let i = 0; i < 7; i++) {
      const randomVariation = (Math.random() - 0.5) * variation;
      history.push(Math.round(currentPrice + randomVariation));
    }
    history[history.length - 1] = currentPrice;
    return history;
  };

  // Prepare data for display
  const priceData = forecast?.forecast?.map(f => parseFloat(f.predictedPrice)) || generateMockHistory();
  const minPrice = Math.min(...priceData);
  const maxPrice = Math.max(...priceData);
  const avgPrice = Math.round(priceData.reduce((a, b) => a + b, 0) / priceData.length);
  const isBestPrice = currentPrice <= minPrice;

  // Trend analysis
  const trendInfo = forecast ? {
    trend: forecast.trend,
    bestBuyIn: forecast.bestBuyIn,
    dataPoints: forecast.dataPoints,
    currentPrice: forecast.currentPrice
  } : null;

  const getTrendColor = (trend) => {
    switch (trend) {
      case "falling":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "rising":
        return "bg-red-500/10 text-red-600 border-red-200";
      default:
        return "bg-amber-500/10 text-amber-600 border-amber-200";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "falling":
        return <TrendingDown className="mt-1 ml-1" size={30} />;
      case "rising":
        return <TrendingUp className="mt-1 ml-1" size={30} />;
      default:
        return <BarChart3 className="mt-1 ml-1" size={30} />;
    }
  };

  const getTrendMessage = (trend, bestBuyIn) => {
    switch (trend) {
      case "falling":
        return `Price likely to drop! Best time to buy in ~${bestBuyIn} day(s)`;
      case "rising":
        return `Price likely to rise soon! Buy now before it increases`;
      default:
        return `Price expected to remain stable over the next week`;
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            Price Forecast
            {isBestPrice && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Best Deal
              </span>
            )}
            {forecast && (
              <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-widest">
                Live Data
              </span>
            )}
          </h3>
          <p className="text-sm text-neutral-500">
            {forecast ? `7-day price prediction (${trendInfo?.dataPoints} data points)` : "Mock price history"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-neutral-400 block uppercase">Current Price</span>
          <span className="font-semibold text-neutral-900 dark:text-white text-lg">
            ₹{(forecast?.currentPrice || currentPrice).toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      {forecast && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center"
          >
            <div className="text-xs text-neutral-500 uppercase mb-1">Min Price</div>
            <div className="font-bold text-emerald-600">₹{minPrice.toLocaleString("en-IN")}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center"
          >
            <div className="text-xs text-neutral-500 uppercase mb-1">Avg Price</div>
            <div className="font-bold text-neutral-700 dark:text-neutral-300">₹{avgPrice.toLocaleString("en-IN")}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-3 text-center"
          >
            <div className="text-xs text-neutral-500 uppercase mb-1">Max Price</div>
            <div className="font-bold text-red-600">₹{maxPrice.toLocaleString("en-IN")}</div>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin text-blue-500 mr-2" size={20} />
          <span className="text-sm text-neutral-600">Loading forecast data...</span>
        </div>
      )}

      {/* Error State */}
      {error && !forecast && (
        <div className="mb-6 p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 flex items-start gap-3">
          <AlertCircle className="text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-300">{error}</p>
            <p className="text-xs text-orange-700/70 dark:text-orange-400/70">Showing historical data instead</p>
          </div>
        </div>
      )}

      {/* The Visual Graph */}
      <div className="relative h-40 w-full flex items-end gap-1 px-2 mb-6">
        {priceData.map((price, i) => {
          const isToday = forecast && i === 0;
          const date = forecast?.forecast?.[i]?.date;
          const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${(price / (maxPrice * 1.1)) * 100}%` }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className={`relative flex-1 rounded-t-lg group transition-all ${
                isToday || price === currentPrice
                  ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30"
                  : "bg-gradient-to-t from-neutral-300 to-neutral-200 dark:from-neutral-700 dark:to-neutral-600"
              }`}
            >
              {/* Tooltip on Hover */}
              <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] py-2 px-3 rounded-lg shadow-xl transition-opacity pointer-events-none whitespace-nowrap z-10">
                <div className="font-semibold">₹{price.toLocaleString("en-IN")}</div>
                {dateStr && <div className="text-neutral-300">{dateStr}</div>}
              </div>

              {/* Day Label */}
              {forecast && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400">
                    {dateStr || `+${i}d`}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Trend Alert */}
      {trendInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 mt-12 p-4 rounded-2xl border flex items-start gap-3 ${getTrendColor(trendInfo.trend)}`}
        >
          <div className="mt-0.5 flex-shrink-0">{getTrendIcon(trendInfo.trend)}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {getTrendMessage(trendInfo.trend, trendInfo.bestBuyIn)}
            </p>
            <p className="text-xs opacity-75 mt-1">
              Based on {trendInfo.dataPoints} historical price points
            </p>
          </div>
        </motion.div>
      )}

      {/* Demand Indicator */}
      <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 flex items-start gap-3">
        <Info className="text-blue-500 mt-1 ml-1 mr-1 flex-shrink-0" size={30} />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {demandCount > 50 ? (
              <>
                <Flame className="inline-block mr-1 mb-1" size={16} />
                High Demand
              </>
            ) : demandCount > 20 ? (
              <>
                <ChartArea className="inline-block mr-1 mb-1" size={16} />
                Moderate Demand
              </>
            ) : (
              <>
                <CircleCheckBig className="inline-block mr-1 mb-1" size={16} />
                Available
              </>
            )}
          </p>
          <p className="text-xs text-blue-700/70 dark:text-blue-400/70">
            {demandCount > 0
              ? `${demandCount} people searched for "${productName}" in the last 24 hours. ${
                  demandCount > 50 ? "Stock might run out soon!" : "Stock is available."
                }`
              : `"${productName}" is available at this store.`}
          </p>
        </div>
        <ArrowUpRight className="text-blue-500 flex-shrink-0" size={18} />
      </div>
    </div>
  );
}