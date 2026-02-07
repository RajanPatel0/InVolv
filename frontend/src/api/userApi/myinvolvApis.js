import api from "../axios.js";

export const createIntent = async({storeId, productId, intentType})=>{
    const  res= await api.post(
        "/userInvolv/create",{
            storeId,
            productId,
            intentType,
        },
        {
            withCredentials: true,
        }
    );
    return res.data;
}

export const getIntent = async()=>{
    const res= await api.get(
        "/userInvolv/intents",
        {
            withCredentials: true,
        }
    );
    return res.data;
}

export const cancelIntent = async(intentId)=>{
    const res= await api.post(
        `/userInvolv/cancel/${intentId}`,
        {
            withCredentials: true,
        }
    );
    return res.data;
}