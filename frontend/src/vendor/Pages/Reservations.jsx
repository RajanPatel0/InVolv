import { useEffect, useState } from "react";
import { Check, X, Clock, Search } from "lucide-react";
import { getReservations, approveReservation, rejectReservation } from "../../api/vendorApi/vendorApis.js";

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Fetch reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getReservations();
      setReservations(res?.data || []);
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filter
  const filtered = reservations.filter((r) =>
    r.productId?.pdtName?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ APPROVE
  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await approveReservation(id);
      // Refresh reservations after action
      await fetchReservations();
      console.log("Reservation approved successfully");
    } catch (err) {
      console.error("Error approving reservation:", err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ❌ REJECT
  const handleReject = async () => {
    try {
      setActionLoading(selected._id);
      await rejectReservation(selected._id, rejectReason);
      // Refresh reservations after action
      await fetchReservations();
      setSelected(null);
      setRejectReason("");
      console.log("Reservation rejected successfully");
    } catch (err) {
      console.error("Error rejecting reservation:", err);
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D44B5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] p-6 space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="text-sm">⚠️ {error}</p>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#000075]">
          Reservations
        </h1>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
          <Search size={16} className="text-[#1D44B5]" />
          <input
            placeholder="Search product..."
            className="outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
          <p className="text-sm">📭 No reservations yet</p>
        </div>
      ) : (
        <>
          {/* 🔵 CARDS VIEW */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl p-5 shadow hover:shadow-lg transition group"
              >
                {r.productId?.image && r.productId.image[0] && (
                  <img
                    src={r.productId.image[0]}
                    className="h-40 w-full object-cover rounded-xl mb-3"
                    alt={r.productId.pdtName}
                  />
                )}

                <h3 className="font-semibold text-[#000075]">
                  {r.productId?.pdtName || "N/A"}
                </h3>

                <p className="text-xs text-gray-500">
                  {r.userId?.email || "N/A"}
                </p>

                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-[#1D44B5] font-semibold">
                    ₹{r.productId?.price || 0}
                  </span>
                  <span className="text-gray-500">
                    Stock: {r.productId?.stock || 0}
                  </span>
                </div>

                {/* STATUS */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <Clock size={14} className="text-yellow-500" />
                  <span className="text-yellow-600 font-medium">
                    {r.status || "ACTIVE"}
                  </span>
                </div>

                {/* ACTIONS */}
                <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleApprove(r._id)}
                    disabled={actionLoading === r._id}
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check size={16} /> {actionLoading === r._id ? "..." : "Accept"}
                  </button>

                  <button
                    onClick={() => setSelected(r)}
                    disabled={actionLoading === r._id}
                    className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X size={16} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 📋 TABLE VIEW */}
          <div className="bg-white p-6 rounded-2xl shadow overflow-x-auto">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="border-b text-gray-500">
                <tr>
                  <th className="text-left pb-3">Product</th>
                  <th>User</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Expiry</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-b hover:bg-[#F5F7FB]">
                    <td className="py-4 font-medium text-[#000075]">
                      {r.productId?.pdtName || "N/A"}
                    </td>
                    <td className="text-center">{r.userId?.email || "N/A"}</td>
                    <td className="text-center text-[#1D44B5] font-semibold">
                      ₹{r.productId?.price || 0}
                    </td>
                    <td className="text-center text-yellow-600">
                      {r.status || "ACTIVE"}
                    </td>
                    <td className="text-center text-xs text-gray-500">
                      {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "N/A"}
                    </td>

                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(r._id)}
                          disabled={actionLoading === r._id}
                          className="p-2 bg-green-50 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >
                          <Check size={16} className="text-green-600" />
                        </button>

                        <button
                          onClick={() => setSelected(r)}
                          disabled={actionLoading === r._id}
                          className="p-2 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                          <X size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 🔴 REJECT MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl animate-fadeIn">

            <h3 className="font-bold text-[#000075] mb-3">
              Reject Reservation
            </h3>

            <textarea
              placeholder="Enter reason..."
              className="w-full p-3 border rounded-xl text-sm outline-none"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setSelected(null);
                  setRejectReason("");
                }}
                disabled={actionLoading === selected._id}
                className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleReject}
                disabled={actionLoading === selected._id}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === selected._id ? "Processing..." : "Confirm Reject"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Reservations;