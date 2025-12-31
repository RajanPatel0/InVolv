import { useState } from "react";
import { UploadCloud, IndianRupee, Layers, Package } from "lucide-react";

const Upload = () => {
  const [formData, setFormData] = useState({
    pdtName: "",
    pdtDesc: "",
    price: "",
    category: "",
    stock: "",
    images: [],
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: [...e.target.files] });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#F9FAFB] min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#000075]">
          Upload Product
        </h1>
        <p className="text-sm text-[#30BC69] font-semibold">
          Add new products to your store
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT – Product Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Product Details */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-[#000075] mb-4">
              Product Details
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="pdtName"
                placeholder="Product Name"
                value={formData.pdtName}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1D44B5] outline-none"
              />

              <textarea
                name="pdtDesc"
                placeholder="Product Description"
                rows="4"
                value={formData.pdtDesc}
                onChange={handleChange}
                className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#1D44B5] outline-none resize-none"
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-[#000075] mb-4">
              Pricing & Inventory
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#1D44B5]"
                />
              </div>

              <div className="relative">
                <Layers className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#1D44B5]"
                />
              </div>

              <div className="relative">
                <Package className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#1D44B5]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT – Image Upload */}
        <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition h-fit">
          <h2 className="text-lg font-semibold text-[#000075] mb-4">
            Product Images
          </h2>

          <label className="border-2 border-dashed border-[#1D44B5] rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-[#EEF3FF] transition">
            <UploadCloud size={40} className="text-[#1D44B5]" />
            <p className="text-sm font-medium mt-2 text-[#000075]">
              Click to upload images
            </p>
            <span className="text-xs text-gray-500">
              PNG, JPG (multiple allowed)
            </span>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

            <div className="flex-1" />

            <button
              className="mt-6 w-full py-4 rounded-xl
                        bg-gradient-to-r from-[#1D44B5] to-[#000075]
                        text-white text-lg font-semibold
                        shadow-lg hover:opacity-90 transition"
            >
              Publish Product
            </button>
        </div>
      </div>

    </div>
  );
};

export default Upload;
