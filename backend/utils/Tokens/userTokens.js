import User from "../../models/UserModels/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateAccessToken = (user) => {    //client attaches token in Authorization header on every protected API call.
    return jwt.sign({
        id: user._id,
    }, process.env.ACCESS_TOKEN_SECRET, 
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
};

export const generateRefreshToken = (user) =>{    //to be stored in httpOnly cookie in client side or in db for refreshing access tokens
    return jwt.sign({
        id: user._id,
    }, process.env.REFRESH_TOKEN_SECRET, 
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token) => { //used by auth middleware to validate(verify) token extracted from Authorization header. on each request of protected route by api
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Access token expired or invalid");
    }
};

export const verifyRefreshToken = (token) => { // needs while actual refreshing access token using refresh token then it need to verify refresh token
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new Error("Refresh token expired or invalid");
    }
};

export const getUserFromToken = async (token) => { // used to get vendor details from access token to identify vendor on protected routes via auth middleware
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) throw new Error("User not found");

    return user;
};

export const isOtpCorrect = async(otp, user)=>{
    return await bcrypt.compare(otp.toString(), user.otp);
}

export const generateOtpToken= (user) =>{
    return jwt.sign({
        id: user._id,   
    },process.env.OTP_TOKEN_SECRET,
    {expiresIn: process.env.OTP_TOKEN_EXPIRY});
};

