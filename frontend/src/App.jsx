import { Routes, Route } from "react-router-dom"
// import {ToastContainer} from "react-toastify";
import Home from "./components/involv_web_page/Home/Home";
import NewUser from "./components/involv_web_page/Authentication/SignUp/NewUser"
import UserSignUp from "./components/involv_web_page/Authentication/SignUp/UserSignUp";
import SignIn from "./components/involv_web_page/Authentication/Login/SignIn";
import VendorSignUp from "./vendor/Authentication/SignUp/VendorSignUp";
import VendorSignIn from "./vendor/Authentication/Login/VendorSignIn";
import VerifyOtp from "./components/involv_web_page/Authentication/VerifyOtp/VerifyOtp";
import Dashboard from "./vendor/Dashboard/Dashboard";

const App = () => {
  return (
    <>
      {/* <ToastContainer position="right-bottom" /> */}

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<NewUser />} />
        <Route path="/userSignUp" element={<UserSignUp />} />
        <Route path="/userSignIn" element={<SignIn />} />

        <Route path="/verify-otp" element={<VerifyOtp /> } />

        <Route path="/vendorSignUp" element={<VendorSignUp />} />
        <Route path="/vendorSignIn" element={<VendorSignIn />} />

        <Route path="/vendor/dashboard" element={<Dashboard />} />

        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  )
}

export default App