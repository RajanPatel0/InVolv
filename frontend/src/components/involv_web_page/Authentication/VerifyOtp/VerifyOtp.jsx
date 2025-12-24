import React, { useState, useEffect } from 'react';
import Otp from '../VerifyOtp/Otp';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from "react-toastify";

import { verifyVendorOtp } from '../../../../api/vendorApi/vendorApis.js';
import { verifyUserOtp } from '../../../../api/userApi/userApis.js';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(30); // in 30 seconds
  const [canResend, setCanResend] = useState(false);

  const location = useLocation();
  const role= location.state?.role || 'user';

  useEffect(() => {
    if (!role) {
      toast.error("Invalid access. Please register again.");
      navigate("/register");
      return;
    }

    const storedEmail = localStorage.getItem("registeredEmail");
    setEmail(storedEmail || "");
    startTimer();
  }, [role]);

   // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

  const startTimer = () => {
    setTimer(30);
    setCanResend(false);
  };

  const handleOtpSubmit = (otpArray) => {
    setOtp(otpArray.join(''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpToken = localStorage.getItem('otpToken');

    if (!otp || !otpToken) {
      toast.error("OTP or token missing");
      return;
    }

    setIsSubmitting(true);

    try {
      let res;

      if (role === "vendor") {
        res = await verifyVendorOtp(otp, otpToken);
        toast.success(res.message || "Vendor verified successfully!");
        setTimeout(() => navigate("/vendorSignIn"), 1500);
      }

      if (role === "user") {
        res = await verifyUserOtp(otp, otpToken);
        toast.success(res.message || "User verified successfully!");
        setTimeout(() => navigate("/userSignIn"), 1500);
      }

      localStorage.removeItem("otpToken");

    } catch (error) {
      console.error("Verify OTP Error:", error);

      if (error?.status === 400) {
        toast.error(error?.data?.message || "❌ Invalid OTP");
      } else {
        toast.error("❌ Something went wrong. Please try again.");
      }
    }finally{
      setIsSubmitting(false);
    }
  };

  // const handleResendOtp = async () => {
  //   if (!canResend) return; // Prevent resending if timer not finished
    
  //   setResendLoading(true);

  //   const email = localStorage.getItem('registeredEmail');
  //   const otpToken = localStorage.getItem('otpToken');

  //   if (!email || !otpToken) {
  //     toast.error("❌ Missing email or token. Please register again.");
  //     setResendLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch('/api/users/resend-Otp', {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${otpToken}`,
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw { status: response.status, data };
  //     }

  //     console.log("Resend OTP Response:", data);

  //     if (data?.success) {
  //       toast.success('📩 OTP resent successfully to your email.');
  //        startTimer(); // Restart timer after successful resend
  //     } else {
  //       toast.error(data?.message || '❌ Failed to resend OTP.');
  //     }

  //   } catch (error) {
  //     console.error("Resend OTP Error:", error);

  //     if (error?.status === 400) {
  //       toast.error(error?.data?.message || "❌ Wrong OTP. Please try again.");
  //     } else {
  //       toast.error(error?.data?.message || "❌ Something went wrong. Please try again.");
  //     }

  //     // setIsSubmitting(false);
  //   }finally {
  //     setResendLoading(false);
  //   }
  // };

  const maskEmail = (email) => {
    if (!email) return "******@gmail.com";

    const [name, domain] = email.split("@");
    if (!name || !domain) return email;

    if (name.length <= 5) {
      return `${name[0]}******${name[name.length - 1]}@${domain}`;
    }

    const start = name.slice(0, 3);
    const end = name.slice(-2);

    return `${start}******${end}@${domain}`;
  };

   const formatTime = (seconds) => {
    return `0:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full h-auto min-h-screen bg-white">
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
      <ToastContainer />
      <div className="flex justify-center items-center pt-16 pb-16">
        <div className="h-auto w-[280px] md:w-[320px] lg:w-[407px] bg-white shadow-[0px_5px_10px_-3px_rgba(0,_0,_0,_0.7)] rounded-[22.92px]">
          <div className="flex flex-col justify-center items-center pt-8">
            <div className="h-[36.55px] w-[36.55px] md:h-[42px] md:w-[42px] lg:w-[56.55px] lg:h-[56px] bg-[#DBEAFE] flex justify-center items-center rounded-[15.28px]">
              <img src="/logo.png" alt="Logo" />
            </div>

            <div className="flex flex-col items-center">
              <p className="font-bold pt-2 md:text-lg lg:text-[18.34px] lg:pt-4">Verify OTP</p>
              <p className="flex flex-col font-bold text-[8px] text-[#868385] md:text-[10px] lg:text-[12.23px] pt-3 text-center">
                An OTP has been sent to your email{' '}
                <span className="text-black inline-block break-words text-center">
                  {maskEmail(email)}
                </span>
              </p>
            </div>
          </div>
          <div className='flex justify-center items-center'>
            <p className="font-bold text-[8px] text-[#868385] pt-3 md:text-[10px] lg:text-[12.23px] ">
              Enter OTP to continue
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center pt-4">
              <div className="pt-2 ">
                <Otp onSubmit={handleOtpSubmit} size={4} />
              </div>
            </div>

            <div className="flex justify-center items-center pt-4">
             {!canResend ? (
                <p className="text-black text-[9px] md:text-[11px] lg:text-[12px]">
                  Resend OTP available in ({formatTime(timer)})
                </p>
              ) : (
                <p className="text-black text-[9px] md:text-[11px] lg:text-[12px]">
                  Didn't receive OTP?{' '}
                  <span 
                    // onClick={handleResendOtp} 
                    className={`text-[#2563EB] cursor-pointer ${resendLoading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </span>
                </p>
              )}
            </div>

            <div className="flex justify-center items-center pt-4 pb-6 md:pb-10 lg:pt-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer lg:w-[362.2px] w-[250px] md:w-[280px] lg:h-[42.03px] bg-blue-600 text-white py-2 font-bold rounded-lg hover:bg-blue-700 text-[10px] md:text-[12px] flex justify-center items-center gap-2 lg:text-[12.23px] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {isSubmitting ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
