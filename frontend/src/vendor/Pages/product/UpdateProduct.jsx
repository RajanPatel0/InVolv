import { X, UploadCloud, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { getImageUrl } from "../../../utils/image.js"; // Import your image utility

const UpdateProduct = ({ product, onClose, onUpdate }) => {
  // Initialize with image array
  const [form, setForm] = useState({
    pdtName: product.pdtName,
    pdtDesc: product.pdtDesc,
    price: product.price,
    category: product.category,
    stock: product.stock,
    image: product.image || [], // Make sure this is an array
  });

  // Track current image index for products with multiple images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Update current image when form.image changes
  useEffect(() => {
    if (form.image && form.image.length > 0) {
      setCurrentImageIndex(0); // Reset to first image
    }
  }, [form.image]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(form);
    onClose();
  };

  // Handle image uploads
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to data URLs for preview
    const newImages = [];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target.result);
        
        // Update form when all files are processed
        if (newImages.length === files.length) {
          setForm({
            ...form,
            image: [...form.image, ...newImages]
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove specific image
  const removeImage = (indexToRemove) => {
    const updatedImages = form.image.filter((_, index) => index !== indexToRemove);
    setForm({ ...form, image: updatedImages });
    
    // Adjust current index if needed
    if (currentImageIndex >= updatedImages.length && updatedImages.length > 0) {
      setCurrentImageIndex(updatedImages.length - 1);
    } else if (updatedImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  // Get current image URL
  const getCurrentImage = () => {
    if (form.image.length === 0) return "/placeholder.png";
    
    const currentImage = form.image[currentImageIndex];
    return getImageUrl(currentImage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-[#000075]">
            Update Product
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-2 gap-6 p-6">

          {/* LEFT – IMAGE SECTION */}
          <div>
            {/* Main Image Display */}
            <div className="relative">
              <img
                src={getCurrentImage()}
                alt="product"
                className="w-full h-60 object-cover rounded-xl shadow-sm"
              />
              
              {/* Image Navigation Arrows (if multiple images) */}
              {form.image.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-2">
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev > 0 ? prev - 1 : form.image.length - 1
                    )}
                    className="p-1 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev < form.image.length - 1 ? prev + 1 : 0
                    )}
                    className="p-1 bg-white/80 rounded-full hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              
              {/* Image Counter */}
              {form.image.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {form.image.length}
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {form.image.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Product Images:</p>
                <div className="flex flex-wrap gap-2">
                  {form.image.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(img)}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                          currentImageIndex === index 
                            ? "border-[#1D44B5]" 
                            : "border-transparent"
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Image Button */}
            <div className="mt-4">
              <label className="w-full flex items-center justify-center gap-2 py-2 rounded-xl
                               bg-[#EEF3FF] text-[#1D44B5] font-medium hover:bg-[#DCE6FF] transition cursor-pointer">
                <UploadCloud size={18} />
                <span>{form.image.length > 0 ? "Add More Images" : "Upload Images"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Upload one or multiple images (PNG, JPG, JPEG)
              </p>
            </div>
          </div>

          {/* RIGHT – FORM */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                name="pdtName"
                value={form.pdtName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none"
                placeholder="Product Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="pdtDesc"
                value={form.pdtDesc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none"
                placeholder="Product Description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none"
                  placeholder="Price"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none"
                  placeholder="Stock"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Accessories">Accessories</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Books">Books</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Display Image Count */}
            {form.image.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  This product has {form.image.length} image{form.image.length !== 1 ? 's' : ''}.
                  {form.image.length > 1 && " Use arrows to navigate."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl bg-[#1D44B5] text-white hover:bg-[#000075] transition"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;