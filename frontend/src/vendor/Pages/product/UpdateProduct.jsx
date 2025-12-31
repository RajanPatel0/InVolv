import { X, UploadCloud } from "lucide-react";
import { useState } from "react";

const UpdateProduct = ({ product, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    pdtName: product.pdtName,
    pdtDesc: product.pdtDesc,
    price: product.price,
    category: product.category,
    stock: product.stock,
    image: product.image,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative animate-scaleIn">

        {/* HEADER */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-[#000075]">
            Update Product
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-6 p-6">

          {/* LEFT – IMAGE */}
          <div>
            <img
              src={form.image}
              alt="product"
              className="w-full h-60 object-cover rounded-xl shadow-sm"
            />

            <button className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl
                               bg-[#EEF3FF] text-[#1D44B5] font-medium hover:bg-[#DCE6FF] transition">
              <UploadCloud size={18} />
              Change Image
            </button>
          </div>

          {/* RIGHT – FORM */}
          <div className="space-y-4">

            <input
              name="pdtName"
              value={form.pdtName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5]"
              placeholder="Product Name"
            />

            <textarea
              name="pdtDesc"
              value={form.pdtDesc}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5]"
              placeholder="Product Description"
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                type="number"
                className="px-4 py-2 border rounded-xl"
                placeholder="Price"
              />
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                type="number"
                className="px-4 py-2 border rounded-xl"
                placeholder="Stock"
              />
            </div>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option>Electronics</option>
              <option>Accessories</option>
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-[#1D44B5] text-white hover:bg-[#000075]"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
