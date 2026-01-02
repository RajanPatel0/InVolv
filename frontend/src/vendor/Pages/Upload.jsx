import { useState } from "react";
import { UploadCloud, IndianRupee, Layers, Package } from "lucide-react";
import { toast } from "react-toastify";
import { addProduct } from "../../api/vendorApi/vendorApis.js";

const Upload = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    pdtName: "",
    pdtDesc: "",
    price: "",
    category: "",
    stock: "",
    images: [],
  });

  const [errors, setErrors] = useState({});

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.pdtName.trim())
      newErrors.pdtName = "Product name is required";

    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Price must be greater than 0";

    if (!formData.category.trim())
      newErrors.category = "Category is required";

    if (formData.stock === "" || Number(formData.stock) < 0)
      newErrors.stock = "Stock must be 0 or more";

    if (!formData.images.length)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error while typing
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const files = [...e.target.files];
    setFormData((prev) => ({ ...prev, images: files }));
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleSubmit = async () => {
    if (loading) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images") {
          value.forEach((img) => data.append("images", img));
        } else {
          data.append(key, value);
        }
      });

      await addProduct(data);

      toast.success("Product added successfully!");

      setFormData({
        pdtName: "",
        pdtDesc: "",
        price: "",
        category: "",
        stock: "",
        images: [],
      });

      setErrors({});
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to add product"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  const inputClass = (error) =>
    `w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 
     ${error ? "border-red-500 focus:ring-red-400" : "focus:ring-[#1D44B5]"}`;

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#F9FAFB] min-h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#000075]">Upload Product</h1>
        <p className="text-sm text-[#30BC69] font-semibold">
          Add new products to your store
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Product Details</h2>

            <div className="space-y-4">
              <div>
                <input
                  name="pdtName"
                  placeholder="Product Name"
                  value={formData.pdtName}
                  onChange={handleChange}
                  className={inputClass(errors.pdtName)}
                />
                {errors.pdtName && (
                  <p className="text-xs text-red-500 mt-1">{errors.pdtName}</p>
                )}
              </div>

              <textarea
                name="pdtDesc"
                placeholder="Product Description"
                rows={4}
                value={formData.pdtDesc}
                onChange={handleChange}
                className={inputClass(false)}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">
              Pricing & Inventory
            </h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`pl-10 ${inputClass(errors.price)}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <input
                  name="category"
                  placeholder="Category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass(errors.category)}
                />
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.category}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={inputClass(errors.stock)}
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <label className={`border-2 border-dashed rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer
            ${errors.images ? "border-red-500" : "border-[#1D44B5]"}`}>
            <UploadCloud size={40} />
            <p className="text-sm mt-2">Click to upload images</p>
            <input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} className="hidden" />
          </label>

          {errors.images && (
            <p className="text-xs text-red-500 mt-2">{errors.images}</p>
          )}

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {formData.images.map((file, index) => (
                <div
                  key={index}
                  className="h-24 w-full rounded-lg overflow-hidden border"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}


          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cursor-pointer mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-[#1D44B5] to-[#000075]
            text-white font-semibold shadow-lg disabled:opacity-70"
          >
            {loading ? "Publishing..." : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
