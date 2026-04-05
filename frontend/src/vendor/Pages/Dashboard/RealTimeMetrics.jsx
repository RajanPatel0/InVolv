import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";

const RealTimeMetrics = ({ data }) => {
  if (!data) return null;

  const { metrics, conversions, hourlyBreakdown } = data;

  return (
    <div className="space-y-6">

      {/* 🔹 METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Searches", value: metrics.searches },
          { label: "Clicks", value: metrics.clicks },
          { label: "Reserves", value: metrics.reserves },
          { label: "Price Alerts", value: metrics.priceAlerts },
          { label: "Stock Alerts", value: metrics.stockAlerts },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs text-gray-500">{item.label}</p>
            <h2 className="text-xl font-bold text-[#000075]">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* 🔹 CONVERSION CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Search → View", value: conversions.searchToView },
          { label: "View → Reserve", value: conversions.viewToReserve },
          { label: "Search → Reserve", value: conversions.searchToReserve },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-gradient-to-r from-[#1D44B5] to-[#000075] text-white rounded-2xl p-5 shadow-md"
          >
            <p className="text-sm opacity-80">{item.label}</p>
            <h2 className="text-2xl font-bold">{item.value}%</h2>
          </div>
        ))}
      </div>

      {/* 🔹 HOURLY LINE CHART */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000075] mb-4">
          Hourly Activity
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={hourlyBreakdown}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="searches" stroke="#1D44B5" />
            <Line type="monotone" dataKey="clicks" stroke="#30BC69" />
            <Line type="monotone" dataKey="reserves" stroke="#FF7A00" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 🔹 FUNNEL BAR */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-[#000075] mb-4">
          Funnel Overview
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: "Search", value: metrics.searches },
              { name: "Click", value: metrics.clicks },
              { name: "Reserve", value: metrics.reserves },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#1D44B5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealTimeMetrics;