import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginVendor } from "../../../api/vendorApi/vendorApis.js";

const VendorSignIn = () => {
  const navigate = useNavigate();
  const [data, setdata] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // remember me
  useEffect(() => {
    try {
      const remembered = JSON.parse(localStorage.getItem("rememberedSubAdmin"));
      if (remembered && remembered.email) {
        setdata((prev) => ({ ...prev, email: remembered.email, password: remembered.password || "", rememberMe: true }));
      }
    } catch {
      // ignore
    }
  }, []);

  const [showPassword, setShowpassword] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChangeInputs = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox") {
      setdata((prev) => ({ ...prev, [name]: checked }));
    } else {
      setdata((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = () => {
    const newValue = !isUser;
    setIsUser(newValue);

    if (newValue) {
      navigate("/userSignIn"); // user
    } else {
      navigate("/vendorSignIn"); // vendor
    }
  };

  // const handleForgot = () => {
    // navigate("/admin/subadmin-forgot-password");
  // };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await loginVendor(data.email, data.password);

      console.log("Login Response:", res.data);
      toast.success(res.message || "Logged in successfully!");

        // persist remembered credentials if requested (email + password)
        try {
          if (data.rememberMe) {
            localStorage.setItem("rememberedVendor", JSON.stringify({ email: data.email, password: data.password }));
          } else {
            localStorage.removeItem("rememberedVendor");
          }
        } catch {
          // ignore storage errors
        }

        localStorage.setItem("vendor", JSON.stringify(res.vendor));

        setTimeout(() => {
          navigate("/vendor/dashboard"); 
        }, 1000);

    } catch (error) {
      console.error(
        "Vendor Login Error:",
        error
      );
      toast.error(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div className="min-h-screen w-[100%] bg-white ">
      <ToastContainer position="top-right" autoClose={3000} />
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


      <div className="pt-8 flex  justify-center">
        <div
          onClick={handleToggle}
          className="w-72   h-14  flex items-center justify-between bg-gray-200 rounded-full  cursor-pointer relative shadow-md"
        >
          <span
            className={`text-md font-semibold px-5 transition-colors duration-300 ${isUser ? "text-white" : "text-gray-700"
              }`}
          >
            User
          </span>
          <span
            className={`text-lg relative z-10  font-semibold px-5  transition-colors duration-300 ${!isUser ? "text-white font-bold" : "text-gray-700"
              }`}
          >
            Vendor
          </span>

          {/* Sliding knob */}
          <div
            className={`absolute top-1 bottom-1 w-1/2 bg-[#000075] w-[calc(50%-0.1rem)] opacity-50 rounded-full transition-transform duration-300 ${isUser ? "translate-x-0" : "translate-x-full "
              }`}
          ></div>
        </div></div>

      <div className="flex justify-center items-center pt-10 pb-16">
        <div
          className="h-[380px] w-[280px] md:h-[420px] md:w-[320px] lg:w-[407px] lg:h-[483px] bg-white shadow-[0px_5px_10px_-3px_rgba(0,_0,_0,_0.7)]
          rounded-[22.92px] "
        >
          <div className="flex flex-col justify-center items-center pt-8 ">
            <div className="h-[36.55px] w-[36.55px] md:h-[42px] md:w-[42px] lg:w-[56.55px] lg:h-[56px] bg-[#DBEAFE] flex justify-center items-center rounded-[15.28px] ">
              <img
                src="/logo.png"
                alt="Logo"
              />
            </div>
            <p className="font-bold pt-2 md:text-lg lg:text-[18.34px] lg:pt-4">
              Welcome Back!
            </p>
            <p className="font-bold text-[8px] text-[#868385] md:text-[10px] lg:text-[12.23px]">
              Sign in to access & manage everything!
            </p>
          </div>
          <div className="flex gap-2 pt-4 justify-center lg:justify-start lg:pl-6 lg:pt-8">
            <form onSubmit={handleSignIn}>
              <div className="flex flex-col gap-2 ">
                <p className="text-[10px] font-bold text-start lg:text-[10.7px]">
                  Email address
                </p>
                <div className="relative">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={data.email}
                      placeholder="Enter Your Email"
                      onChange={onChangeInputs}
                      className="w-fit  px-3 lg:w-[362.2px] lg:h-[42.03px] py-2  pl-10   border border-[#CCCBCB] placeholder:text-[12px] rounded-lg placeholder:text-[#BEBEBE] focus:outline-none focus:ring-0"
                      required
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="absolute top-[11px] left-3"
                    >
                      <path
                        fill="#CCCBCB"
                        d="M4.616 19q-.691 0-1.153-.462T3 17.384V6.616q0-.691.463-1.153T4.615 5h14.77q.69 0 1.152.463T21 6.616v10.769q0 .69-.463 1.153T19.385 19zM20 6.885l-7.552 4.944q-.106.055-.214.093q-.109.037-.234.037t-.234-.037t-.214-.093L4 6.884v10.5q0 .27.173.443t.443.173h14.769q.269 0 .442-.173t.173-.443zM12 11l7.692-5H4.308zM4 6.885v.211v-.811v.034V6v.32v-.052v.828zV18z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-3 lg:pt-5">
                <p className="text-[10px] font-bold text-start lg:text-[10.7px]">
                  Password
                </p>
                <div className="relative">
                  <div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={data.password}
                      placeholder="Enter Your Password"
                      onChange={onChangeInputs}
                      className="block w-full rounded-lg border border-[#CCCBCB] py-2 pl-10 pr-10 text-sm placeholder:text-[#BEBEBE] focus:outline-none focus:ring-0"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setShowpassword((prev) => !prev);
                      }}
                      className="cursor-pointer absolute top-2 right-3"
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#CCCBCB"
                            d="M12 9a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5c-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0a9.821 9.821 0 0 0-17.64 0"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#CCCBCB"
                            d="M2 5.27L3.28 4L20 20.72L18.73 22l-3.08-3.08c-1.15.38-2.37.58-3.65.58c-5 0-9.27-3.11-11-7.5c.69-1.76 1.79-3.31 3.19-4.54zM12 9a3 3 0 0 1 3 3a3 3 0 0 1-.17 1L11 9.17A3 3 0 0 1 12 9m0-4.5c5 0 9.27 3.11 11 7.5a11.8 11.8 0 0 1-4 5.19l-1.42-1.43A9.86 9.86 0 0 0 20.82 12A9.82 9.82 0 0 0 12 6.5c-1.09 0-2.16.18-3.16.5L7.3 5.47c1.44-.62 3.03-.97 4.7-.97M3.18 12A9.82 9.82 0 0 0 12 17.5c.69 0 1.37-.07 2-.21L11.72 15A3.064 3.064 0 0 1 9 12.28L5.6 8.87c-.99.85-1.82 1.91-2.42 3.13"
                          />
                        </svg>
                      )}
                    </button>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="absolute top-[10px] left-3  "
                      width="15"
                      height="16"
                      viewBox="0 0 15 16"
                      fill="none"
                    >
                      <path
                        d="M4.7003 6.34891V4.82065C4.7003 2.71089 5.64706 1 7.75682 1C9.86659 1 10.8133 2.71089 10.8133 4.82065V6.34891M1.26172 12.3091V8.79412C1.26172 7.9383 1.26172 7.51039 1.4283 7.1841C1.57469 6.89627 1.80848 6.66221 2.09615 6.51549C2.4232 6.34967 2.85111 6.34967 3.70693 6.34967H11.8067C12.6625 6.34967 13.0905 6.34967 13.4175 6.51549C13.705 6.66201 13.9388 6.89579 14.0853 7.18334C14.2519 7.51039 14.2519 7.9383 14.2519 8.79412V12.3091C14.2519 13.1649 14.2519 13.5929 14.0853 13.9199C13.9388 14.2075 13.705 14.4412 13.4175 14.5878C13.0905 14.7543 12.6625 14.7543 11.8067 14.7543H3.70693C2.85111 14.7543 2.4232 14.7543 2.09615 14.5878C1.8086 14.4412 1.57482 14.2075 1.4283 13.9199C1.26172 13.5936 1.26172 13.1657 1.26172 12.3091Z"
                        stroke="#CCCBCB"
                        stroke-width="1.14619"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="text-[10px] flex justify-between  pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      id="rememberMe"
                      checked={data.rememberMe}
                      className="cursor-pointer lg:w-[10px] rounded lg:scale-150 scale-90"
                      onChange={onChangeInputs}
                    />
                    <label htmlFor="rememberMe" className="text-[10.7px] cursor-pointer">Remember me</label>
                  </div>
                  <p
                    className="text-[#2563EB] lg:text-[10.7px] cursor-pointer"
                    // onClick={handleForgot}
                  >
                    Forgot Password?
                  </p>
                </div>
              </div>
              <div className="pt-5 lg:pt-10">
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer lg:w-[362.2px] w-full lg:h-[42.03px] bg-[#000075] text-white py-2 rounded-lg hover:bg-blue-700 text-[10px] flex justify-center items-center gap-2 lg:text-[12.23px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="13"
                        viewBox="0 0 16 13"
                        fill="none"
                      >
                        <path
                          d="M0.867188 6.34326H11.2678"
                          stroke="white"
                          strokeWidth="0.76413"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.4043 9.78195L11.5646 6.34337L7.4043 2.90479"
                          stroke="white"
                          strokeWidth="0.76413"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8.50805 0.995052H12.0012C13.2361 0.995052 13.8539 0.995052 14.2373 1.66672C14.6211 2.33763 14.6211 3.41887 14.6211 5.57983V7.10809C14.6211 9.26905 14.6211 10.3503 14.2373 11.0212C13.8539 11.6929 13.2361 11.6929 12.0012 11.6929H8.50805"
                          stroke="white"
                          strokeWidth="1.14619"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default VendorSignIn;
