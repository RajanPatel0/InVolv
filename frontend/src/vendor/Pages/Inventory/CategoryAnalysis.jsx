const CategoryAnalysis = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">

      <h2 className="text-lg font-bold text-[#000075]">
        Category Analysis
      </h2>

      {/* 🔹 CATEGORY CARDS */}
      <div className="grid md:grid-cols-3 gap-4">
        {(data || []).map((cat, i) => (
          <div
            key={i}
            className="p-4 bg-[#EEF3FF] rounded-xl hover:shadow-md transition"
          >
            <h3 className="font-semibold text-[#000075]">
              {cat.category}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Total Stock: {cat.totalStock}
            </p>

            <p className="text-sm text-gray-500">
              Avg Stock: {cat.avgStock}
            </p>

            <p className="text-sm text-red-500">
              Low Stock: {cat.lowStockCount}
            </p>
          </div>
        ))}
      </div>

      {/* 🔹 TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[600px] w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr>
              <th className="text-left py-2">Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {(data || []).flatMap((cat) =>
              (cat.products || []).map((p, i) => (
                <tr key={i} className="border-b hover:bg-[#F5F7FB]">
                  <td className="py-3 font-medium text-[#000075]">
                    {p.pdtName}
                  </td>
                  <td className="text-center">{cat.category}</td>
                  <td className="text-center">{p.stock}</td>
                  <td className="text-center text-[#1D44B5] font-semibold">
                    ₹{p.price}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default CategoryAnalysis;