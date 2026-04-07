import { TrendingDown, AlertTriangle, Package } from "lucide-react";

const Recommendations = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">

      <h2 className="text-lg font-bold text-[#000075]">
        Inventory Recommendations
      </h2>

      {/* 🔹 SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[  // Using optional chaining and default values to prevent errors if data is missing
          { label: "Total", value: data?.summary?.totalProducts || 0 },
          { label: "Restock", value: data?.summary?.needsRestock || 0 },
          { label: "Reduce", value: data?.summary?.shouldReduce || 0 },
          { label: "At Risk", value: data?.summary?.atStockOutRisk || 0 },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-[#EEF3FF] hover:scale-105 transition"
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-xl font-bold text-[#1D44B5]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* 🔻 REDUCE PRODUCTS */}
      <div>
        <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
          <TrendingDown size={16} /> Reduce Stock
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {(data?.reduce || []).map((p, i) => (
            <div
              key={i}
              className="p-4 bg-red-50 rounded-xl border border-red-100 hover:shadow-md transition"
            >
              <h4 className="font-semibold text-[#000075]">
                {p.pdtName}
              </h4>

              <p className="text-xs text-gray-500">{p.category}</p>

              <div className="flex justify-between mt-3 text-sm">
                <span>Stock: {p.currentStock}</span>
                <span className="text-red-600 font-semibold">
                  Reduce to {p.suggestedStock}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                {p.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔸 EMPTY STATES */}
      {(data?.reduce?.length || 0) === 0 && (
        <div className="text-center text-gray-400 py-6">
          <Package size={28} className="mx-auto mb-2" />
          No recommendations
        </div>
      )}
    </div>
  );
};

export default Recommendations;