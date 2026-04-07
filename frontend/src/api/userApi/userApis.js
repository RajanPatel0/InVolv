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

export const searchNearbyProducts = async ({
    productName,
    lat,
    lng,
    radius = 100000,
  }) => {
    const res = await api.post("/search/product", {
      productName,
      lat,
      lng,
      radius,
    });
    return res.data;
};

// Get store details with similar stores
export const getStoreDetails = async ({ storeId, lat, lng, productName }) => {
  const res = await api.post("/search/store-details", {
    storeId,
    lat,
    lng,
    productName,
  });
  return res.data;
};

// Get user profile (requires authentication)
export const getUserProfile = async () => {
  const res = await api.get("/user/user-profile");
  return res.data;
};

// Logout user (requires authentication)
export const logoutUserApi = async () => {
  const res = await api.post("/user/logout");
  return res.data;
};