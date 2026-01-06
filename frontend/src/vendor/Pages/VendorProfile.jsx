import { useEffect, useState } from "react";
import { MapPin, Store, Mail, Phone, Save, Edit2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getVendorProfile } from "../../api/vendorApi/vendorApis.js"; // Adjust path as needed

/* Leaflet Fix */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Create custom icon
const storeIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  shadowSize: [41, 41]
});

const LocationPicker = ({ position, setPosition, editable }) => {
  const map = useMapEvents({
    click(e) {
      if (editable) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  // Center map when position changes
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  return position && position[0] && position[1] ? (
    <Marker 
      position={position} 
      draggable={editable}
      icon={storeIcon}
      eventHandlers={{
        dragend: (e) => {
          if (editable) {
            const marker = e.target;
            const newPos = marker.getLatLng();
            setPosition([newPos.lat, newPos.lng]);
          }
        }
      }}
    >
      <Popup>
        <div className="p-2">
          <strong>Store Location</strong>
          <p className="text-sm mt-1">
            Lat: {position[0].toFixed(6)}<br />
            Lng: {position[1].toFixed(6)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
};

const VendorProfile = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [vendor, setVendor] = useState({
    storeName: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    location: { 
      type: "Point", 
      coordinates: [28.6139, 77.209] // Default to Delhi as fallback
    },
    isVerified: false,
    // Add any other fields from your API response
  });

  const [position, setPosition] = useState([28.6139, 77.209]);

  // Fetch vendor profile data
  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVendorProfile();
      
      if (response.success && response.vendor) {
        const vendorData = response.vendor;
        
        // Set vendor state
        setVendor({
          storeName: vendorData.storeName || "",
          email: vendorData.email || "",
          phone: vendorData.phone || "",
          address: vendorData.address || vendorData.location?.address || "",
          category: vendorData.category || "",
          location: vendorData.location || { type: "Point", coordinates: [28.6139, 77.209] },
          isVerified: vendorData.isVerified || false,
          businessName: vendorData.businessName || "",
          pincode: vendorData.pincode || "",
          city: vendorData.city || "",
          state: vendorData.state || "",
          // Add other fields as needed
        });

        // Set map position
        if (vendorData.location?.coordinates && Array.isArray(vendorData.location.coordinates)) {
          // Note: MongoDB stores coordinates as [lng, lat], Leaflet needs [lat, lng]
          const coords = vendorData.location.coordinates;
          if (coords.length >= 2) {
            setPosition([coords[1], coords[0]]); // Convert to [lat, lng]
          }
        } else if (vendorData.latitude && vendorData.longitude) {
          // Alternative if coordinates are stored separately
          setPosition([vendorData.latitude, vendorData.longitude]);
        }
      } else {
        setError("Failed to load vendor profile");
      }
    } catch (err) {
      console.error("Error fetching vendor profile:", err);
      setError(err.response?.data?.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  // Update position when vendor.location changes
  useEffect(() => {
    if (vendor.location?.coordinates && Array.isArray(vendor.location.coordinates)) {
      const coords = vendor.location.coordinates;
      if (coords.length >= 2) {
        setPosition([coords[1], coords[0]]); // Convert to [lat, lng]
      }
    }
  }, [vendor.location]);

  const handleUpdate = async () => {
    if (!edit) return;
    
    try {
      setSaving(true);
      
      // Prepare data for API - convert back to MongoDB format [lng, lat]
      const payload = {
        ...vendor,
        location: {
          type: "Point",
          coordinates: [position[1], position[0]] // Convert back to [lng, lat]
        }
      };

      // Call your update API here
      // Example: await updateVendorProfile(payload);
      
      console.log("Update payload:", payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert("Profile updated successfully!");
      
      setEdit(false);
      // Refresh data after update
      fetchVendorProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (key, value) => {
    setVendor(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1D44B5] mx-auto mb-4" />
          <p className="text-gray-600">Loading vendor profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] p-8">
        <nav className="w-full bg-[#000075] text-white shadow-lg mb-8">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/vendor/dashboard")}>
              <img src="/logo.png" className="h-10 w-10" alt="Logo" />
              <div>
                <p className="font-bold text-xl">InVolv</p>
                <p className="text-sm font-medium opacity-80">Not So Far</p>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchVendorProfile}
            className="bg-[#1D44B5] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#163a9a] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">

      {/* NAVBAR */}
      <nav className="w-full bg-[#000075] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/vendor/dashboard")}
          >
            <img src="/logo.png" className="h-10 w-10" alt="Logo" />
            <div>
              <p className="font-bold text-xl">InVolv</p>
              <p className="text-sm font-medium opacity-80">Not So Far</p>
            </div>
          </div>
          
          {/* Optional: Add vendor store name in header */}
          <div className="hidden md:block">
            <p className="text-sm opacity-90">Store:</p>
            <p className="font-semibold">{vendor.storeName}</p>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* BACK + HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-2 text-[#1D44B5] font-semibold hover:gap-3 transition-all w-fit"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            {/* Display coordinates when editing */}
            {edit && position && (
              <div className="hidden md:block text-sm bg-white px-3 py-2 rounded-lg border">
                <span className="text-gray-500">Coordinates: </span>
                <span className="font-mono">
                  {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </span>
              </div>
            )}
            
            <button
              onClick={() => (edit ? handleUpdate() : setEdit(true))}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition min-w-[140px] justify-center
                ${edit
                  ? "bg-[#1D44B5] text-white hover:bg-[#163a9a] disabled:bg-gray-400"
                  : "bg-white text-[#1D44B5] border border-[#1D44B5]/30"
                }`}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : edit ? (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              ) : (
                <>
                  <Edit2 size={16} />
                  Edit Profile
                </>
              )}
            </button>
            
            {edit && (
              <button
                onClick={() => {
                  setEdit(false);
                  fetchVendorProfile(); // Reset to original data
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">

          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-[#000075]">
              Vendor Profile
            </h2>
            <p className="text-gray-500 text-sm md:text-base">
              Manage your store & location details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            {/* FORM SECTION */}
            <div className="space-y-6">
              {[
                { label: "Store Name", icon: Store, key: "storeName", type: "text" },
                { label: "Email", icon: Mail, key: "email", type: "email" },
                { label: "Phone", icon: Phone, key: "phone", type: "tel" },
                { label: "Category", icon: Store, key: "category", type: "text" },
                { label: "Business Name", icon: Store, key: "businessName", type: "text" },
              ].map(({ label, icon: Icon, key, type }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label}
                  </label>
                  <div className="flex items-center gap-3 bg-[#F5F7FB] px-4 py-3 rounded-xl mt-1 border transition focus-within:border-[#1D44B5] focus-within:ring-1 focus-within:ring-[#1D44B5]">
                    <Icon size={16} className="text-[#1D44B5] flex-shrink-0" />
                    <input
                      type={type}
                      disabled={!edit}
                      value={vendor[key] || ""}
                      onChange={(e) => handleInputChange(key, e.target.value)}
                      className="bg-transparent outline-none w-full text-sm md:text-base"
                      placeholder={`Enter ${label.toLowerCase()}`}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Address
                </label>
                <textarea
                  disabled={!edit}
                  value={vendor.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full mt-1 bg-[#F5F7FB] rounded-xl p-3 text-sm md:text-base outline-none resize-none border transition focus:border-[#1D44B5] focus:ring-1 focus:ring-[#1D44B5]"
                  placeholder="Enter store address"
                />
              </div>

              {/* Verification Badge */}
              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold
                    ${vendor.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {vendor.isVerified ? "✓ Verified Vendor" : "⚠ Not Verified"}
                </span>
                
                {/* Last Updated */}
                <span className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* MAP SECTION */}
            <div className="h-full">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                  <MapPin size={14} /> Store Location
                </p>
                
                {edit && position && (
                  <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Click on map or drag marker
                  </div>
                )}
              </div>

              <div className="h-[380px] rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                <MapContainer 
                  center={position} 
                  zoom={15} 
                  className="h-full w-full"
                  scrollWheelZoom={edit}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    position={position}
                    setPosition={setPosition}
                    editable={edit}
                  />
                </MapContainer>
              </div>

              {/* Map Controls Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[#1D44B5] rounded-full"></div>
                    <span>Your store location</span>
                  </div>
                  <div>
                    <span className="font-medium">Latitude: </span>
                    {position[0].toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium">Longitude: </span>
                    {position[1].toFixed(6)}
                  </div>
                </div>
                
                {edit && (
                  <p className="text-xs text-gray-500 mt-3">
                    💡 <strong>How to update location:</strong> Click anywhere on the map or drag the marker to set new location
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;