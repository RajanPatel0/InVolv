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
export const getStoreDetails = async ({ storeName, lat, lng, productName }) => {
  const res = await api.post("/search/store-details", {
    storeName,
    lat,
    lng,
    productName,
  });
  return res.data;
};