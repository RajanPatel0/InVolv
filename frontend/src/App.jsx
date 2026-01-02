import { Routes, Route } from "react-router-dom"
import { Navigate } from "react-router-dom";
import {ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./components/involv_web_page/Home/Home";
import NewUser from "./components/involv_web_page/Authentication/SignUp/NewUser"
import UserSignUp from "./components/involv_web_page/Authentication/SignUp/UserSignUp";
import SignIn from "./components/involv_web_page/Authentication/Login/SignIn";
import VendorSignUp from "./vendor/Authentication/SignUp/VendorSignUp";
import VendorSignIn from "./vendor/Authentication/Login/VendorSignIn";
import VerifyOtp from "./components/involv_web_page/Authentication/VerifyOtp/VerifyOtp";

import Dashboard from "./vendor/Pages/Dashboard";
import Upload from "./vendor/Pages/Upload";
import Setting from "./vendor/Pages/Setting";
import Products from "./vendor/Pages/product/Products";

import VendorProfile from "./vendor/Pages/VendorProfile";
import Sidebar from "./vendor/components/SideBar";
import Topbar from "./vendor/components/Topbar";
import VendorLayout from "./vendor/layout/vendorLayout";

const App = () => {
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

        <Route path="/verify-otp" element={<VerifyOtp /> } />

        <Route path="/vendorSignUp" element={<VendorSignUp />} />
        <Route path="/vendorSignIn" element={<VendorSignIn />} />


        {/* <Route path="/vendor/sidebar" element={<Sidebar />} />
        <Route path="/vendor/topbar" element={<Topbar />} />
        <Route path="/vendor/*" element={<VendorLayout />} /> */}

        <Route path="/vendor/profile" element={<VendorProfile />} />

        {/* Vendor Module */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Upload />} />
          <Route path="settings" element={<Setting />} />
          <Route path="products" element={<Products />} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  )
}

export default App