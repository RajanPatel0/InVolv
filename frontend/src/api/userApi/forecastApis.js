import api from "../axios.js";

export const fetchPriceForecast = async (productId, vendorId) => {
    const res = await api.get(`/user/forecast/${productId}/forecast/${vendorId}`);
    return res.data;
};

