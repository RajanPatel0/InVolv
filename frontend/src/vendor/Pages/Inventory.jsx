import { useEffect, useState } from "react";
import Recommendations from "./Inventory/Recommendations";
import CategoryAnalysis from "./Inventory/CategoryAnalysis";
import StockOutPredictions from "./Inventory/StockOutPredictions";
import { getInventoryRecommendations, getCategoryInventoryAnalysis, getPredictStockOutDates } from "../../api/vendorApi/vendorApis.js";

const Inventory = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all inventory data in parallel
        const [recommendations, category, stockOut] = await Promise.all([
          getInventoryRecommendations().catch(err => {
            console.error("Error fetching recommendations:", err);
            return null;
          }),
          getCategoryInventoryAnalysis().catch(err => {
            console.error("Error fetching category analysis:", err);
            return null;
          }),
          getPredictStockOutDates().catch(err => {
            console.error("Error fetching stock-out predictions:", err);
            return null;
          }),
        ]);

        setData({
          recommendations: recommendations?.data || { restock: [], reduce: [], optimal: [], atRisk: [], summary: {} },
          category: category?.data || [],
          stockOut: stockOut?.data || [],
        });

      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D44B5]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="text-sm">⚠️ Error loading inventory: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 space-y-8">

      <h1 className="text-2xl font-bold text-[#000075]">
        Inventory Analytics
      </h1>

      <Recommendations data={data.recommendations} />

      <CategoryAnalysis data={data.category} />

      <StockOutPredictions data={data.stockOut} />

    </div>
  );
};

export default Inventory;