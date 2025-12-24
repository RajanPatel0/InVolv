import { useState } from "react";
import { UserPlus, Store, Lock, Eye, EyeOff, Map, MapPin, ShoppingCart } from "lucide-react";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../../api/userApi/userApis.js";

export default function UserSignUp() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&#])[A-Za-z\d@!%*?&#]{8,}$/
      .test(password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Dynamic phone validation only
    if (e.target.name === "phone") {
      if (e.target.value.length === 10 && !validatePhone(e.target.value)) {
        setErrors((prev) => ({
          ...prev,
          phone: "Phone number must be exactly 10 digits"
        }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleSubmit = async() => {
    if (loading) return;
    setSubmitted(true);

    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!validateEmail(form.email))
      newErrors.email = "Enter a valid email address";
    if (!validatePhone(form.phone))
      newErrors.phone = "Phone number must be exactly 10 digits";
    if (!validatePassword(form.password))
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & symbol";

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;
    
    try{
          setLoading(true);
          const payload={
            fullName: form.name,
            email: form.email,
            phone: form.phone,
            password: form.password
          };
    
          const res= await registerUser(payload);
          console.log("Registration Success:", res);
    
          localStorage.setItem("otpToken", res.otpToken);
          localStorage.setItem("registeredEmail", form.email);

          navigate("/verify-otp", { state: { role: "user" } });
        }catch(err){
          const message = err.response?.data?.message || "Something went wrong";
          alert(message);
        }finally{
          setLoading(false);
        }
  };

  return (
    <div className="min-h-screen bg-[#EDF2FF]">
      
      {/* NAVBAR BANNER */}
      <nav className="w-full bg-[#000075] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Logo + InVolv */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/logo.png"
              alt="InVolv Logo"
              className="h-10 w-10 select-none"
            />
            <div className="flex flex-col items-start">
              <p className="font-bold text-xl">InVolv</p>
              <p className="text-sm font-[500]">Not So Far</p>
            </div>
          </div>

        </div>
      </nav>

      {/* SIGNUP CARD */}
      <div className="min-h-[90vh] flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">

          {/* LEFT FORM SECTION */}
          <div className="p-10">
            <div className="flex items-center justify-center mb-8">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3209/3209993.png"
                className="w-12 h-12"
                alt="logo"
              />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-1 text-center">
              Create Your Account
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Join our community of tech innovators
            </p>

            {/* INPUTS */}
            <div className="space-y-5">

              {/* NAME */}
              <div className="relative">
                <FaUser className="absolute left-3 top-3 text-gray-500 text-xl" />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
                {submitted && errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-gray-500 text-xl" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
                {submitted && errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* PHONE */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-gray-500 text-xl" />
                <input
                  type="tel"
                  maxLength="10"
                  name="phone"
                  placeholder="Enter your phone number"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={handleChange}
                />
                {(errors.phone && form.phone.length === 10) ||
                (submitted && errors.phone) ? (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                ) : null}
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-500 text-xl" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
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
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full bg-[#000075] flex items-center justify-center gap-x-2 
                  text-white py-3 rounded-lg font-semibold 
                  ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"}`}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>

              <p className="text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <span className="text-blue-600 cursor-pointer hover:underline"
                onClick={()=>navigate("/userSignIn")}>
                  Sign in instead
                </span>
              </p>

            </div>
          </div>

          {/* RIGHT INFO SECTION */}
          <div className="bg-[#000075] text-white flex flex-col justify-center p-10">
            <h3 className="text-2xl font-bold mb-6">
              Your Nearby Store Finder Platform
            </h3>

            <ul className="space-y-4 text-lg">
              <li className="flex gap-3 items-start hover:translate-x-1 transition cursor-pointer">
                <span className="text-2xl"><MapPin className="mt-3"/></span>
                <span>Find the nearest store with your required product instantly.</span>
              </li>

              <li className="flex gap-3 items-start hover:translate-x-1 transition cursor-pointer">
                <span className="text-2xl"><ShoppingCart className="mt-3"/> </span>
                <span>Check real-time stock availability & best pricing from vendors.</span>
              </li>

              <li className="flex gap-3 items-start hover:translate-x-1 transition cursor-pointer">
                <span className="text-2xl"><Map className="mt-3"/></span>
                <span>Get optimized route navigation from your location to the store.</span>
              </li>

              <li className="flex gap-3 items-start hover:translate-x-1 transition cursor-pointer">
                <span className="text-2xl"><Store /></span>
                <span>Vendors update inventory & prices in real time.</span>
              </li>
            </ul>

            <div className="mt-10 grid grid-cols-2 gap-5">
              <div className="bg-white/20 backdrop-blur-lg p-5 rounded-xl text-center shadow-md">
                <p className="text-2xl font-bold">5000+</p>
                <p className="text-sm">Nearby Stores</p>
              </div>

              <div className="bg-white/20 backdrop-blur-lg p-5 rounded-xl text-center shadow-md">
                <p className="text-2xl font-bold">10,000+</p>
                <p className="text-sm">Daily Searches</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
