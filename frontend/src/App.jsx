import { Routes, Route } from "react-router-dom"
// import {ToastContainer} from "react-toastify";
import Home from "./components/involv_web_page/Home/Home";
import NewUser from "./components/involv_web_page/Authentication/SignUp/NewUser"
import UserSignUp from "./components/involv_web_page/Authentication/SignUp/UserSignUp";

const App = () => {
  return (
    <>
      {/* <ToastContainer position="right-bottom" /> */}

      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<NewUser />} />
        <Route path="/userSignUp" element={<UserSignUp />} />
      </Routes>
    </>
  )
}

export default App