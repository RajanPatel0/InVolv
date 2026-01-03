import { AlertTriangle, Loader2 } from "lucide-react";

const DeleteConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  productName,
  loading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative animate-scaleIn">
        
        {/* HEADER */}
        <div className="flex flex-col items-center p-6 border-b">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Delete Product</h2>
          <p className="text-gray-500 text-center mt-2">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 font-medium text-center">
              "{productName}"
            </p>
            <p className="text-red-600 text-sm text-center mt-1">
              This will permanently delete the product and all its images.
            </p>
          </div>

          {/* WARNING MESSAGE */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <ul className="text-yellow-800 text-sm space-y-1">
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>All product images will be deleted from Cloudinary</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>Product information will be permanently removed</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>This action cannot be recovered</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 ${
              loading 
                ? "bg-red-300 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 text-white"
            } transition`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Product"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;