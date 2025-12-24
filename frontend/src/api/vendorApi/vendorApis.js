import api from "../axios.js";

export const registerVendor  = async(vendorData)=>{
    const response = await api.post("/vendor/register", vendorData);
    return response.data;
};

export const verifyVendorOtp = async (otp, otpToken) => {
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

export const loginVendor = async(email, password)=>{
  const res = await api.post(
    "/vendor/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
  return res.data;
};