import { useState } from "react";
import { Store, ShoppingCart, MapPin, Map, Lock, Eye, EyeOff, Check } from "lucide-react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

import { registerVendor } from "../../../api/vendorApi/vendorApis.js";

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

const VendorSignUp=() => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    storeName: "",
    email: "",
    phone: "",
    address: "",
    category: "",
    password: "",
  });

  const [coords, setCoords] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePhone = (phone) =>
    /^[0-9]{10}$/.test(phone);

  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&#]).{8,}$/.test(password);

  // Map click handler
  function LocationSelector() {
    useMapEvents({
      click(e) {
        setCoords(e.latlng);
        setMapOpen(false);
      }
    });
    return coords ? <Marker position={coords} icon={markerIcon} /> : null;
  }

  // Form handler
  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async() => {
    if (loading) return;
    setSubmitted(true);

    let newErrors = {};

    if (!form.storeName.trim()) newErrors.storeName = "Store Name is required";
    if (!validateEmail(form.email)) newErrors.email = "Enter a valid email";
    if (!validatePhone(form.phone)) newErrors.phone = "Phone must be 10 digits";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.category) newErrors.category = "Select a category";
    if (!coords) newErrors.coords = "Please pin your store location on map";
    if (!validatePassword(form.password))
      newErrors.password =
        "Password must be 8+ chars with upper, lower, number & symbol";

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;

    try{
      setLoading(true);
      const payload={
        ...form,
        location:{
          type: "Point",
          coordinates: [coords.lng, coords.lat],
        },
      };

      const res= await registerVendor(payload);
      console.log("Registration Success:", res);

      localStorage.setItem("otpToken", res.otpToken);
      navigate("/verify-otp", { state: { role: "vendor" } });
    }catch(err){
      const message = err.response?.data?.message || "Something went wrong";
      alert(message);
    }finally{
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EDF2FF]">

      {/* NAVBAR */}
      <nav className="w-full bg-[#000075] text-white shadow-lg sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logo.png" className="h-10 w-10" />
            <div>
              <p className="font-bold text-xl">InVolv</p>
              <p className="text-sm font-medium">Not So Far</p>
            </div>
          </div>
        </div>
      </nav>

      {/* SIGNUP CARD */}
      <div className="flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-5xl 
                        grid grid-cols-1 md:grid-cols-2 overflow-hidden">

          {/* LEFT FORM */}
          <div className="p-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">
              Vendor Store Registration
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Register your store & start getting customers instantly!
            </p>

            <div className="space-y-5">

              {/* STORE NAME */}
              <div className="relative">
                <Store className="absolute left-3 top-3 text-lg" />
                <input
                  name="storeName"
                  placeholder="Store Name"
                  className="w-full pl-11 py-3 rounded-lg border"
                  onChange={handleChange}
                />
                {submitted && errors.storeName && (
                  <p className="text-red-500 text-sm">{errors.storeName}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-lg" />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className="w-full pl-11 py-3 rounded-lg border"
                  onChange={handleChange}
                />
                {submitted && errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* PHONE */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-lg" />
                <input
                  name="phone"
                  maxLength="10"
                  placeholder="Phone Number"
                  className="w-full pl-11 py-3 rounded-lg border"
                  onChange={handleChange}
                />
                {submitted && errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-lg" />
                <input
                  name="address"
                  placeholder="Store Address"
                  className="w-full pl-11 py-3 rounded-lg border"
                  onChange={handleChange}
                />
                {submitted && errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>

              {/* CATEGORY */}
              <div className="relative">
                <ShoppingCart className="absolute left-3 top-3 text-lg" />
                <select
                  name="category"
                  className="w-full pl-11 py-3 rounded-lg border bg-white"
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Clothing</option>
                  <option>Automobile</option>
                  <option>Grocery</option>
                  <option>HouseHold</option>
                </select>
                {submitted && errors.category && (
                  <p className="text-red-500 text-sm">{errors.category}</p>
                )}
              </div>

              {/* LOCATION PICKER */}
              <div>
                <button
                  onClick={() => setMapOpen(true)}
                  className="w-full bg-[#000075] text-white py-3 rounded-lg shadow hover:bg-blue-700"
                >
                  <Map className="inline-block mr-2" />
                  {coords ? "Change Store Location" : "Pick Store Location on Map"}
                </button>

                {submitted && errors.coords && (
                  <p className="text-red-500 text-sm mt-1">{errors.coords}</p>
                )}

                {mapOpen && (
                  <div className="mt-3 rounded-xl overflow-hidden border shadow-lg">
                    <MapContainer
                      center={[20.5937, 78.9629]}
                      zoom={5}
                      style={{ height: "300px", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <LocationSelector />
                    </MapContainer>
                  </div>
                )}
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-lg" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  className="w-full pl-11 py-3 rounded-lg border"
                  onChange={handleChange}
                />
                 {showPassword ? (
                  <EyeOff
                    className="absolute right-3 top-3 text-gray-500 text-xl cursor-pointer"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye
                    className="absolute right-3 top-3 text-gray-500 text-xl cursor-pointer"
                    onClick={() => setShowPassword(true)}
                  />
                )}
                {submitted && errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-[#000075] flex items-center justify-center gap-x-2 
                  text-white py-3 rounded-lg font-semibold 
                  ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
              >
                {loading ? "Registering..." : "Register Store"}
              </button>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <span className="text-blue-600 cursor-pointer hover:underline"
                onClick={()=>navigate("/vendorSignIn")}>
                  Sign in instead
                </span>
              </p>

            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="bg-[#000075] text-white p-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4">
              Register Your Store On InVolv
            </h3>
            <ul className="space-y-4 text-lg">
              <li className="flex"><Check className="mt-1 mr-1"/>  Get customers from your nearby area</li>
              <li className="flex"><Check className="mt-1 mr-1"/> Update your catalog in real-time</li>
              <li className="flex"><Check className="mt-1 mr-1"/> Show store on live map</li>
              <li className="flex"><Check className="mt-1 mr-1"/> Manage stock & pricing easily</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}

export default VendorSignUp;