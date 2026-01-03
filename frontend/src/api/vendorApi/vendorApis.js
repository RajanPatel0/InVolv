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

export const addProduct= async(formData)=>{
  const res=await api.post(
    "/store/addProduct",
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

export const getAllProducts = async()=>{
  const res= await api.get(
    "/store/products",
    {
      withCredentials: true,
    }
  )
  return res.data;
};

export const updateProduct = async (productId, formData) => {
  const res = await api.patch(
    `/store/updateProduct/${productId}`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};