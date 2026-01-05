import { X, UploadCloud, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getImageUrl } from "../../../utils/image.js";
import { updateProduct } from "../../../api/vendorApi/vendorApis.js";
import { toast } from "react-toastify";

const UpdateProduct = ({ product, onClose, onUpdate }) => {
  const [form, setForm] = useState({
    pdtName: product.pdtName,
    pdtDesc: product.pdtDesc,
    price: product.price,
    category: product.category,
    stock: product.stock,
    image: product.image || [], //for array
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newImages, setNewImages] = useState([]); // Store new files to upload
  const [imagesToRemove, setImagesToRemove] = useState([]); // Store URLs of images to remove
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Separate existing images from new previews
  const existingImages = form.image.filter(img => 
    !img.startsWith('data:image') && // Not a data URL
    !newImages.some(newImg => newImg.preview === img) // Not a new image preview
  );

  // All images to display (existing + new previews)
  const allDisplayImages = [...existingImages, ...newImages.map(img => img.preview)];

  useEffect(() => {
    if (allDisplayImages.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [allDisplayImages.length]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      
      // Add text fields
      formData.append("pdtName", form.pdtName);
      formData.append("pdtDesc", form.pdtDesc);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      
      // Add images to remove
      if (imagesToRemove.length > 0) {
        formData.append("removeImages", JSON.stringify(imagesToRemove));
      }
      
      // Add new image files
      newImages.forEach((fileObj, index) => {
        formData.append("images", fileObj.file);
      });

      // Call the API
      const response = await updateProduct(product._id, formData);
      toast.success("Product updated successfully!");
      
      if (response.success) {
        // Call the onUpdate callback with the updated product
        onUpdate(response.product);
        onClose();
      } else {
        setError(response.message || "Failed to update product");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating product");
      console.error("Update error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of images (max 5 total)
    const totalImages = existingImages.length + newImages.length + files.length;
    if (totalImages > 5) {
      setError("Maximum 5 images allowed per product");
      return;
    }

    const newImageObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random() // Unique ID for each new image
    }));

    setNewImages(prev => [...prev, ...newImageObjects]);
    setError("");
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove existing image
  const removeExistingImage = (indexToRemove) => {
    const imageUrl = existingImages[indexToRemove];
    setImagesToRemove(prev => [...prev, imageUrl]);
    
    // Update current index if needed
    if (currentImageIndex >= allDisplayImages.length - 1 && allDisplayImages.length > 1) {
      setCurrentImageIndex(allDisplayImages.length - 2);
    }
  };

  // Remove new image (not uploaded yet)
  const removeNewImage = (indexToRemove) => {
    const imageToRemove = newImages[indexToRemove];
    
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(imageToRemove.preview);
    
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    
    // Update current index if needed
    if (currentImageIndex >= allDisplayImages.length - 1 && allDisplayImages.length > 1) {
      setCurrentImageIndex(allDisplayImages.length - 2);
    }
  };

  // Get current image to display
  const getCurrentImage = () => {
    if (allDisplayImages.length === 0) return "/placeholder.png";
    
    const currentImage = allDisplayImages[currentImageIndex];
    return getImageUrl(currentImage);
  };

  // Check if an image is new (not yet uploaded)
  const isNewImage = (index) => {
    return index >= existingImages.length;
  };

  // Get image source for thumbnail
  const getThumbnailSrc = (index) => {
    if (index < existingImages.length) {
      return getImageUrl(existingImages[index]);
    } else {
      const newIndex = index - existingImages.length;
      return newImages[newIndex]?.preview;
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newImages.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl relative animate-scaleIn max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-[#000075]">
            Update Product
          </h2>
          <button 
            onClick={onClose}
            disabled={uploading}
            className="disabled:opacity-50"
          >
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
              {allDisplayImages.length > 1 && (
                <div className="absolute top-1/2 left-0 right-0 flex justify-between transform -translate-y-1/2 px-2">
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev > 0 ? prev - 1 : allDisplayImages.length - 1
                    )}
                    className="p-1 bg-white/80 rounded-full hover:bg-white"
                    disabled={uploading}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex(prev => 
                      prev < allDisplayImages.length - 1 ? prev + 1 : 0
                    )}
                    className="p-1 bg-white/80 rounded-full hover:bg-white"
                    disabled={uploading}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              
              {/* Image Counter */}
              {allDisplayImages.length > 0 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {allDisplayImages.length}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Image Thumbnails */}
            {allDisplayImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  Product Images ({allDisplayImages.length}/5 max):
                  {existingImages.length > 0 && ` ${existingImages.length} existing`}
                  {newImages.length > 0 && `, ${newImages.length} new`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {allDisplayImages.map((_, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getThumbnailSrc(index)}
                        alt={`Thumbnail ${index + 1}`}
                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${
                          currentImageIndex === index 
                            ? "border-[#1D44B5]" 
                            : "border-transparent"
                        } ${isNewImage(index) ? "border-dashed border-gray-300" : ""}`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                      {/* Remove button with different styling for existing vs new */}
                      <button
                        onClick={() => isNewImage(index) 
                          ? removeNewImage(index - existingImages.length)
                          : removeExistingImage(index)
                        }
                        className={`absolute -top-1 -right-1 rounded-full w-5 h-5 flex items-center justify-center text-xs ${
                          isNewImage(index)
                            ? "bg-gray-500 text-white hover:bg-gray-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                        disabled={uploading}
                      >
                        ×
                      </button>
                      {/* New badge for newly added images */}
                      {isNewImage(index) && (
                        <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Image Button */}
            <div className="mt-4">
              <label className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl
                               ${uploading ? "bg-gray-200 cursor-not-allowed" : "bg-[#EEF3FF] hover:bg-[#DCE6FF]"} 
                               text-[#1D44B5] font-medium transition cursor-pointer`}>
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={18} />
                    <span>{allDisplayImages.length > 0 ? "Add More Images" : "Upload Images"}</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading || allDisplayImages.length >= 5}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {allDisplayImages.length >= 5 
                  ? "Maximum 5 images reached. Remove some to add more."
                  : "Upload one or multiple images (PNG, JPG, JPEG)"
                }
              </p>
            </div>

            {/* Images to remove notice */}
            {imagesToRemove.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">{imagesToRemove.length} image(s)</span> marked for removal. 
                  They will be deleted when you click "Update Product".
                </p>
              </div>
            )}
          </div>

          {/* RIGHT – FORM */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                name="pdtName"
                value={form.pdtName}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none disabled:bg-gray-100"
                placeholder="Product Name"
                disabled={uploading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="pdtDesc"
                value={form.pdtDesc}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none disabled:bg-gray-100"
                placeholder="Product Description"
                disabled={uploading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₹) *
                </label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none disabled:bg-gray-100"
                  placeholder="Price"
                  disabled={uploading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock *
                </label>
                <input
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none disabled:bg-gray-100"
                  placeholder="Stock"
                  disabled={uploading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-[#1D44B5] focus:border-[#1D44B5] outline-none disabled:bg-gray-100"
                disabled={uploading}
                required
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

            {/* Summary Info */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Summary:</span> {existingImages.length} existing images, 
                {newImages.length > 0 ? ` +${newImages.length} new images to upload` : ''}
                {imagesToRemove.length > 0 ? `, ${imagesToRemove.length} to remove` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="sticky bottom-0 bg-white flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || allDisplayImages.length === 0}
            className={`px-6 py-2 rounded-xl transition flex items-center gap-2 ${
              uploading || allDisplayImages.length === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#1D44B5] text-white hover:bg-[#000075]"
            }`}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              "Update Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;