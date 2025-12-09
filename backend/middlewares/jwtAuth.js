import jwt from "jsonwebtoken";
import Vendor from "../../models/StoreModels/vendorModel.js";

export const decodeToken = async(token, secret)=>{
    if(!token){
        throw new Error("Token is Missing");
    }
    if(!secret){
        throw new Error("Secret isnt provided");
    }
    return jwt.verify(token, secret);
};

export const userValidateOtpToken = async (req,res, next)=>{
    try{
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if(!tokenFromHeader){
            return res.status(401).json({
                message: "Unauthorized Access: No Token Provided"});
        }

        const token = tokenFromHeader;
        const decoded = await decodeToken(token, process.env.OTP_TOKEN_SECRET);
        
        const vendor = await Vendor.findById(decoded._id || decoded.id);
        if(!vendor){
            return res.status(404).json({
                message: "Vendor Not Found",
            });
        };

        req.vendor = vendor;
        req.vendorId = vendor._id;
        next();

    }catch (err){
        console.log("Error validating OTP Token", err);
        return res.status(401).json({
            message: "Invalid OTP Token"
        });
    }
};