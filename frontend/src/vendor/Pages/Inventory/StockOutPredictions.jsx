import { AlertTriangle } from "lucide-react";

const StockOutPredictions = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">

      <h2 className="text-lg font-bold text-[#000075] mb-4">
        Stock-Out Predictions
      </h2>

      {data.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          No stock-out risks detected 🎉
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((item, i) => (
            <div
              key={i}
              className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
            >
              <h3 className="font-semibold text-[#000075]">
                {item.pdtName}
              </h3>
              <p className="text-sm text-yellow-700">
                Stock may run out in {item.daysToStockOut} days
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockOutPredictions;