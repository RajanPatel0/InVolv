import api from "../axios.js";

export const registerVendor  = async(vendorData)=>{
    const response = await api.post("/vendor/register", vendorData);
    return response.data;
};

export const verifyOtp = async (otp, otpToken) => {
  const res = await api.post(
    "/vendor/verify-Otp",
    { otp },
    {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    }
  );

  return res.data;
};