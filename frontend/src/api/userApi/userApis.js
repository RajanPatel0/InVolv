import api from "../axios.js";

export const registerUser = async (userData) => {
  const response = await api.post("/user/register", userData);
  return response.data;
};

export const verifyUserOtp = async (otp, otpToken) => {
  const res = await api.post(
    "/user/verify-otp",
    { otp },
    {
      headers: {    
        Authorization: `Bearer ${otpToken}`,
        },
    }
  );
    return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post(
    "/user/login",
    { email, password },
    {
      withCredentials: true,
    }
  );
  return res.data;
};