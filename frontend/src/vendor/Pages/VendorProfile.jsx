import { useEffect, useState } from "react";
import { MapPin, Store, Mail, Phone, Save, Edit2, ArrowLeft } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

const LocationPicker = ({ position, setPosition, editable }) => {
  useMapEvents({
    click(e) {
      if (editable) setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} draggable={editable} />;
};

const VendorProfile = () => {
  const navigate = useNavigate();
  const [edit, setEdit] = useState(false);

  const [vendor, setVendor] = useState({
    storeName: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    location: { coordinates: [28.6139, 77.209] },
    isVerified: false,
  });

  const [position, setPosition] = useState(vendor.location.coordinates);

  useEffect(() => {
    setVendor({
      storeName: "InVolv Store",
      email: "vendor@involv.com",
      phone: "9876543210",
      address: "Gill Road, Ludhiana, Punjab",
      category: "Electronics",
      location: { coordinates: [30.901, 75.857] },
      isVerified: true,
    });
    setPosition([30.901, 75.857]);
  }, []);

  const handleUpdate = async () => {
    const payload = {
      ...vendor,
      location: { type: "Point", coordinates: position },
    };
    console.log(payload);
    setEdit(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB]">

      {/* NAVBAR */}
      <nav className="w-full bg-[#000075] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/vendor/dashboard")}
          >
            <img src="/logo.png" className="h-10 w-10" />
            <div>
              <p className="font-bold text-xl">InVolv</p>
              <p className="text-sm font-medium opacity-80">Not So Far</p>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* BACK + HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <button
            onClick={() => navigate("/vendor/dashboard")}
            className="flex items-center gap-2 text-[#1D44B5] font-semibold hover:gap-3 transition-all"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>

          <button
            onClick={() => (edit ? handleUpdate() : setEdit(true))}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold shadow-md transition
              ${
                edit
                  ? "bg-[#1D44B5] text-white hover:bg-[#163a9a]"
                  : "bg-white text-[#1D44B5] border border-[#1D44B5]/30"
              }`}
          >
            {edit ? <Save size={16} /> : <Edit2 size={16} />}
            {edit ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#000075]">
              Vendor Profile
            </h2>
            <p className="text-gray-500 text-sm">
              Manage your store & location details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* FORM */}
            <div className="space-y-6">
              {[
                { label: "Store Name", icon: Store, key: "storeName" },
                { label: "Email", icon: Mail, key: "email" },
                { label: "Phone", icon: Phone, key: "phone" },
                { label: "Category", icon: Store, key: "category" },
              ].map(({ label, icon: Icon, key }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-gray-500">
                    {label}
                  </label>
                  <div className="flex items-center gap-3 bg-[#F5F7FB] px-4 py-3 rounded-xl mt-1 border focus-within:border-[#1D44B5] transition">
                    <Icon size={16} className="text-[#1D44B5]" />
                    <input
                      disabled={!edit}
                      value={vendor[key]}
                      onChange={(e) =>
                        setVendor({ ...vendor, [key]: e.target.value })
                      }
                      className="bg-transparent outline-none w-full text-sm"
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Address
                </label>
                <textarea
                  disabled={!edit}
                  value={vendor.address}
                  rows={3}
                  className="w-full mt-1 bg-[#F5F7FB] rounded-xl p-3 text-sm outline-none resize-none border focus:border-[#1D44B5]"
                />
              </div>

              <span
                className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold
                  ${
                    vendor.isVerified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {vendor.isVerified ? "Verified Vendor" : "Not Verified"}
              </span>
            </div>

            {/* MAP */}
            <div>
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-2 mb-3">
                <MapPin size={14} /> Store Location
              </p>

              <div className="h-[380px] rounded-2xl overflow-hidden shadow-md border">
                <MapContainer center={position} zoom={15} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker
                    position={position}
                    setPosition={setPosition}
                    editable={edit}
                  />
                </MapContainer>
              </div>

              {edit && (
                <p className="text-xs text-gray-500 mt-2">
                  Click or drag marker to update location
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;
