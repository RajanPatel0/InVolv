import { useMemo, useState, useEffect } from "react";
import { Edit, Trash2, Package, Search, ChevronLeft, ChevronRight } from "lucide-react";

import UpdateProduct from "./UpdateProduct";
import DeleteConfirmation from "./DeleteConfirmation"; // Import the modal
import { getAllProducts, deleteProduct } from "../../../api/vendorApi/vendorApis.js";
import { getImageUrl } from "../../../utils/image.js";
import { toast } from "react-toastify";

const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Delete state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getAllProducts();
      setProducts(res.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching products"
      );
    } finally {
      setLoading(false);
    }
  };

  // FILTER
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.pdtName?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  // PAGINATION
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startPage = Math.max(1, page - Math.floor(PAGE_WINDOW / 2));
  const endPage = Math.min(totalPages, startPage + PAGE_WINDOW - 1);

  const handleUpdateProduct = async (updatedProductData) => {
    try {
      setProducts(prev => prev.map(p => 
        p._id === updatedProductData._id ? updatedProductData : p
      ));
    } catch (err) {
      console.error("Failed to update product in local state:", err);
    }
  };

  // DELETE HANDLER
  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
    setDeleteError(""); // Clear any previous errors
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      setDeleteLoading(true);
      setDeleteError("");

      const response = await deleteProduct(deletingProduct._id);
      
      if (response.success) {
        // Remove from local state
        setProducts(prev => prev.filter(p => p._id !== deletingProduct._id));
        
        // Reset pagination if needed
        if (paginatedProducts.length === 1 && page > 1) {
          setPage(page - 1);
        }
        
        // Close modal
        setDeletingProduct(null);
        toast.success("Product deleted successfully!");
        // Show success message (you can add a toast notification here)
        console.log("Product deleted successfully");
      } else {
        setDeleteError(response.message || "Failed to delete product");
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Error deleting product"
      );
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProduct(null);
    setDeleteError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#1D44B5] font-semibold">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 font-semibold mt-20">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#000075]">Products</h1>
          <p className="text-sm text-gray-500">Manage all your listed items</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
          <Package size={18} className="text-[#1D44B5]" />
          <span className="font-semibold text-[#000075]">
            {filteredProducts.length} Items
          </span>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
          <Search size={18} className="text-[#1D44B5]" />
          <input
            placeholder="Search product"
            className="outline-none text-sm bg-transparent"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          className="bg-white px-4 py-2 rounded-xl shadow-sm text-sm"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Categories</option>
          {[...new Set(products.map((p) => p.category))].map(
            (cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            )
          )}
        </select>
      </div>

      {/* HORIZONTAL SCROLL CARDS */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              className="w-64 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition"
            >
              <img
                src={getImageUrl(p.image?.[0])}
                alt={p.pdtName}
                className="h-36 w-full object-cover rounded-xl mb-3"
              />
              <h3 className="font-semibold text-[#000075]">{p.pdtName}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{p.pdtDesc}</p>
              <div className="flex justify-between mt-3 text-sm">
                <span className="font-semibold text-[#1D44B5]">₹{p.price}</span>
                <span className="text-gray-500">Stock: {p.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
        <table className="min-w-[720px] w-full">
          <thead className="sticky top-0 bg-white border-b text-gray-500 text-sm">
            <tr>
              <th className="text-left pb-3">Sr</th>
              <th className="text-left pb-3">Product</th>
              <th className="pb-3 text-center">Category</th>
              <th className="pb-3 text-center">Price</th>
              <th className="pb-3 text-center">Stock</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((p, i) => (
              <tr key={p._id} className="border-b last:border-none hover:bg-[#F5F7FB]">
                <td className="py-4">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="py-4 font-medium text-[#000075]">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getImageUrl(p.image?.[0])} 
                      alt={p.pdtName}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span>{p.pdtName}</span>
                  </div>
                </td>
                <td className="py-4 text-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {p.category}
                  </span>
                </td>
                <td className="py-4 text-center font-semibold text-[#1D44B5]">
                  ₹{p.price}
                </td>
                <td className="py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    p.stock > 10 
                      ? "bg-green-100 text-green-800" 
                      : p.stock > 0 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-red-100 text-red-800"
                  }`}>
                    {p.stock} in stock
                  </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-2 bg-[#EEF3FF] rounded-lg hover:bg-[#DCE6FF] transition"
                      title="Edit"
                    >
                      <Edit size={16} className="text-[#1D44B5]" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(p)}
                      className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-end items-center gap-2 mt-5">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg bg-[#EEF3FF] hover:bg-[#DCE6FF] transition disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: endPage - startPage + 1 }).map(
            (_, i) => {
              const p = startPage + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    page === p
                      ? "bg-[#1D44B5] text-white"
                      : "bg-[#EEF3FF] hover:bg-[#DCE6FF]"
                  }`}
                >
                  {p}
                </button>
              );
            }
          )}

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg bg-[#EEF3FF] hover:bg-[#DCE6FF] transition disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* UPDATE PRODUCT MODAL */}
      {editingProduct && (
        <UpdateProduct
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmation
        isOpen={!!deletingProduct}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        productName={deletingProduct?.pdtName}
        loading={deleteLoading}
      />

      {/* DELETE ERROR TOAST (Optional) */}
      {deleteError && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn">
            <AlertTriangle size={20} />
            <div>
              <p className="font-medium">Delete Failed</p>
              <p className="text-sm opacity-90">{deleteError}</p>
            </div>
            <button 
              onClick={() => setDeleteError("")}
              className="ml-4 hover:opacity-80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;