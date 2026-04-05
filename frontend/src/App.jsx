import { useEffect } from "react";
import { Routes, Route } from "react-router-dom"
import { Navigate } from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import { useSearchStore}  from "./api/stores/searchStore"
import { initializeFCM } from "./api/userApi/fcmInit.js"

import PageNotFound from "./vendor/components/PageNotFound";
import Home from "./components/involv_web_page/pages/Home/Home";
import NewUser from "./components/involv_web_page/Authentication/SignUp/NewUser"
import UserSignUp from "./components/involv_web_page/Authentication/SignUp/UserSignUp";
import SignIn from "./components/involv_web_page/Authentication/Login/SignIn";
import VendorSignUp from "./vendor/Authentication/SignUp/VendorSignUp";
import VendorSignIn from "./vendor/Authentication/Login/VendorSignIn";
import VerifyOtp from "./components/involv_web_page/Authentication/VerifyOtp/VerifyOtp";

import StoreDetails from "./components/involv_web_page/pages/Store/StoreDetails";
import MyInvolv from "./components/involv_web_page/pages/MyInvolv/MyInvolv";

import Dashboard from "./vendor/Pages/Dashboard";
import Upload from "./vendor/Pages/Upload";
import Inventory from "./vendor/Pages/Inventory.jsx";
import Products from "./vendor/Pages/product/Products";
import Reservations from "./vendor/Pages/Reservations";

import VendorProfile from "./vendor/Pages/VendorProfile";
// import Sidebar from "./vendor/components/SideBar";
// import Topbar from "./vendor/components/Topbar";
import VendorLayout from "./vendor/layout/VendorLayout";

const App = () => {

  const checkAuthStatus = useSearchStore(state => state.checkAuthStatus);
  const clearUserData = useSearchStore(state => state.clearUserData);
  const isAuthenticated = useSearchStore(state => state.isAuthenticated);
  
  useEffect(() => {
    // Check auth on app load
    checkAuthStatus();
    
    // Listen for storage events (for logout from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' && !e.newValue) {
        clearUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuthStatus, clearUserData]);

  // Initialize FCM when user is authenticated
  // Initialize FCM when user is authenticated
  useEffect(() => {
    console.log("🔐 Auth check for FCM - isAuthenticated:", isAuthenticated);
    if (isAuthenticated && localStorage.getItem('user')) {
      console.log("✅ User authenticated, initializing FCM");
      initializeFCM();
    } else {
      console.log("❌ User not authenticated, skipping FCM");
    }
  }, [isAuthenticated]);

  return (
    <>
      {/* <ToastContainer position="right-bottom" /> */}
      <ToastContainer position="top-right" autoClose={3000}/>

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<NewUser />} />
        <Route path="/userSignUp" element={<UserSignUp />} />
        <Route path="/userSignIn" element={<SignIn />} />
        <Route path="/store-details" element={<StoreDetails />} />
        <Route 
          path="/myinvolv" 
          element={
          <ProtectedRoute>
            <MyInvolv/>
          </ProtectedRoute>
        } />
        

        <Route path="/verify-otp" element={<VerifyOtp /> } />

        <Route path="/vendorSignUp" element={<VendorSignUp />} />
        <Route path="/vendorSignIn" element={<VendorSignIn />} />

        <Route path="/vendor/profile" element={<VendorProfile />} />
        

        {/* Vendor Module */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="products" element={<Products />} />
          <Route path="reservations" element={<Reservations />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </>
  )
}

export default App