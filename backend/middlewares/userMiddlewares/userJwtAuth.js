import jwt from "jsonwebtoken";
import User from "../../models/UserModels/userModel.js";

export const decodeToken = async(token, secret)=>{
    if(!token){
        throw new Error("Token is Missing");
    }
    if(!secret){
        throw new Error("Secret isnt provided");
    }
    return jwt.verify(token, secret);
};

export const userValidateOtpToken = async (req,res, next)=>{    //This otpToken contains the vendor’s ID and it is verified in your OTP middleware.
    try{
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const tokenFromHeader = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if(!tokenFromHeader){
            return res.status(401).json({
                message: "Unauthorized Access: No Token Provided"});
        }

        const token = tokenFromHeader;  //extracting token from Authorization header
        const decoded = await decodeToken(token, process.env.OTP_TOKEN_SECRET); //decoding otp token using otp secret
        
        const user = await User.findById(decoded._id || decoded.id);    //fetching user using id from decoded token
        if(!user){
            return res.status(404).json({
                message: "User Not Found",
            });
        };

        req.user = user;    //attaching user to req object 
        req.userId = user._id;  //attaching user id to req object
        next();

    }catch (err){
        console.log("Error validating OTP Token", err);
        return res.status(401).json({
            message: "Invalid OTP Token"
        });
    }
};