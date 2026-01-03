import { useMemo, useState, useEffect } from "react";
import { Edit, Trash2, Package, Search, ChevronLeft, ChevronRight } from "lucide-react";

import UpdateProduct from "./UpdateProduct";
import { getAllProducts } from "../../../api/vendorApi/vendorApis.js";
import { getImageUrl } from "../../../utils/image.js";

const PAGE_SIZE = 5;
const PAGE_WINDOW = 5;

const Products = () => {
  const [products, setProducts]= useState([]);
  const [loading , setLoading]= useState(true);
  const [error, setError]= useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts=async()=>{
      try{
        setLoading(true);
        const res= await getAllProducts();
        setProducts(res.products || []);
      }catch(err){
        setError(
          err.response.data.message || "Errorfetching products"
        );
      }finally{
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-[#1D44B5] font-semibold">
        Loading products...
      </div>
    );
  }

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      // Calling API to update the product
      // await updateProductApi(updatedProduct._id, updatedProduct);
      
      // Update local state
      setProducts(prev => prev.map(p => 
        p._id === updatedProduct._id ? updatedProduct : p
      ));
      
      console.log("Product updated:", updatedProduct);
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

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
                  {p.pdtName}
                </td>
                <td className="py-4 text-center">{p.category}</td>
                <td className="py-4 text-center font-semibold text-[#1D44B5]">
                  ₹{p.price}
                </td>
                <td className="py-4 text-center">{p.stock}</td>
                <td className="py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setEditingProduct(p)}
                      className="p-2 bg-[#EEF3FF] rounded-lg hover:bg-[#DCE6FF]"
                    >
                      <Edit size={16} className="text-[#1D44B5]" />
                    </button>
                    <button className="p-2 bg-red-50 rounded-lg hover:bg-red-100">
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
            className="p-2 rounded-lg bg-[#EEF3FF]"
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
                  className={`px-3 py-1 rounded-lg text-sm ${
                    page === p
                      ? "bg-[#1D44B5] text-white"
                      : "bg-[#EEF3FF]"
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
            className="p-2 rounded-lg bg-[#EEF3FF]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
       {editingProduct && (
          <UpdateProduct
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onUpdate={handleUpdateProduct}
          />
        )}
    </div>
  );
};

export default Products;
