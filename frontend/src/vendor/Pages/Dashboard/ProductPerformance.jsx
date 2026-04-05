import { Package } from "lucide-react";

const ProductPerformance = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">

      <div className="flex items-center gap-2 mb-4">
        <Package className="text-[#1D44B5]" />
        <h2 className="text-xl font-bold text-[#000075]">
          Product Performance
        </h2>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No product analytics yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center p-4 bg-[#F5F7FB] rounded-xl hover:shadow transition"
            >
              <div>
                <p className="font-semibold text-[#000075]">
                  {p.name}
                </p>
                <p className="text-xs text-gray-500">
                  {p.category}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-[#1D44B5]">
                  {p.reserves} Orders
                </p>
                <p className="text-xs text-gray-500">
                  {p.conversionRate}% conv.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPerformance;