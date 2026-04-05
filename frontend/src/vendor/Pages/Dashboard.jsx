import { useEffect, useState } from "react";
import RealTimeMetrics from "./Dashboard/RealTimeMetrics";
import ComparisonCards from "./Dashboard/ComparisonCards";
import ConversionFunnel from "./Dashboard/ConversionFunnel";
import HourlyActivityChart from "./Dashboard/HourlyActivityChart";
import ProductPerformance from "./Dashboard/ProductPerformance";
import { getRealTimeMetrics, getComparisonMetrics, getConversionFunnel, getHourlyFunnel, getProductConversionFunnel } from "../../api/vendorApi/vendorApis.js";

const Dashboard = () => {

  const [metricsData, setMetricsData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [hourlyData, setHourlyData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [period, setPeriod] = useState("day");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all analytics data in parallel
        const [realtime, comparison, funnel, hourly, products] = await Promise.all([
          getRealTimeMetrics().catch(err => {
            console.error("Error fetching realtime metrics:", err);
            return null;
          }),
          getComparisonMetrics(period).catch(err => {
            console.error("Error fetching comparison metrics:", err);
            return null;
          }),
          getConversionFunnel("week").catch(err => {
            console.error("Error fetching conversion funnel:", err);
            return null;
          }),
          getHourlyFunnel("week").catch(err => {
            console.error("Error fetching hourly funnel:", err);
            return null;
          }),
          getProductConversionFunnel("week").catch(err => {
            console.error("Error fetching product conversion:", err);
            return null;
          }),
        ]);

        if (realtime?.data) {
          setMetricsData(realtime.data);
        }
        if (comparison?.data) {
          setComparisonData(comparison.data);
        }
        if (funnel?.data) {
          setFunnelData(funnel.data);
        }
        if (hourly?.data) {
          setHourlyData(hourly.data);
        }
        if (products?.data) {
          setProductData(products.data);
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [period]);

  return (
    <div className="p-6 space-y-8 bg-[#F5F7FB] min-h-screen">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="text-sm">⚠️ Error loading dashboard: {error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D44B5]"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* REAL TIME */}
          <RealTimeMetrics data={metricsData} />

          {/* PERIOD SWITCH */}
          <div className="flex gap-2">
            {["day", "week", "month"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition
                  ${
                    period === p
                      ? "bg-[#1D44B5] text-white"
                      : "bg-white text-[#1D44B5]"
                  }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          {/* COMPARISON */}
          <ComparisonCards data={comparisonData} />

          {/* CONVERSION FUNNEL */}
          <ConversionFunnel data={funnelData} period={period} />

          {/* HOURLY ACTIVITY */}
          <HourlyActivityChart data={hourlyData} />

          {/* PRODUCT PERFORMANCE */}
          <ProductPerformance data={productData} />
        </>
      )}

    </div>
  );
};

export default Dashboard;