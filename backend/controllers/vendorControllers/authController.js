import jwt from "jsonwebtoken";
import Vendor from "../../models/StoreModels/vendorModel.js";

import { verifyRefreshToken, generateAccessToken} from "../../utils/vendorTokens.js";



// Refresh Access Token controller or its endpoint for refreshing the access token using refresh token
const refreshAccessToken = async(req, res)=>{
    try{
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;    //taking refresh token from httpOnly cookie or from request body

        if(!refreshToken){  //if no refresh token provided
            return res.status(400).json({message: "Refresh Token Missing"});
        }

        const decode = verifyRefreshToken(refreshToken) //if refresh token found verify it

        const vendor = await Vendor.findById(decode._id).select("-password");   //if valid refresh token get vendor details from it

        if(!vendor){    //if no vendor found for id in refresh token
            return res.status(404).json({message: "Vendor Not Found"});
        }

        const newAccessToken = generateAccessToken(vendor); //for vendor found generate new access token

        res.status(200).json({  //& return it in response as of access token
            status: "success",
            accessToken: newAccessToken
        });
    }catch (err){
        res.status(401).json({message: err.message});
    }
};