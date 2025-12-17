import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../models/UserModels/userModel.js";

import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateOtpToken, isOtpCorrect } from "../../utils/Tokens/userTokens.js"
import { sendUserOtpEmail } from "../../utils/OTPS/sendUserOtpEmail.js";

export const registerUser = async (req, res)=> {
    try{
        const {fullName, email, phone, password } = req.body;

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                success: false, 
                message: "Email Already Registered"
            });
        }

        const newUser = new User({
            fullName,
            email,
            phone,
            password
        });
        await newUser.save();

        const otpResult = await sendUserOtpEmail(newUser);    //otp sending model after user creation
            if(!otpResult.success){
                return res.status(500).json({
                    success: false,
                    message: "User Created but OTP sending failed"
                })
            }
        
        const otpToken= generateOtpToken(newUser);   //short lived token for otp validity

        return res.status(200).json({
            success: true,
            message: "User Registered Successfully",
            newUser,
            otpToken,
        })

    }catch(err){
        console.log("Error Registering User", err);
        return res.status(500).json({
            success: false,
            message : "Internal Server Error"
        });
    }
};

export const verifyUserOtp = async(req, res)=>{
    try{
        const { otp } = req.body;
        if(!otp){
            return res.status(400).json({
                success: false,
                message: "Otp Is Required"
            });
        };

        const userId = req.user?._id;
        if(!userId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access: User ID not found"
            });
        };

        const user = await User.findById(userId);
        if(!user || !user.otp || !user.otpExpiresAt){
            return res.status(404).json({
                success: false,
                message: "User Not Found or OTP not set"
            });
        };

        const isExpired = Date.now() > new Date(user.otpExpiresAt);
        if(isExpired){
            return res.status(400).json({
                success: false,
                message: "Otp has expired, Request new one"
            });
        };

        const isOtpValid = await isOtpCorrect(otp, user);
        if(!isOtpValid){
            return res.status(400).json({
                success: false,
                message: "Invalid Otp"
            });
        };

        user.otp = null;
        user.otpExpiresAt = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User Verified Successfully. You can now Login."
        });
    }catch(err){
        console.log("Error verifying otp", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message,
        });
    }
};

export const loginUser = async(req, res)=>{
    try{
        const { email , password } = req.body;

        if(!email || !password ){
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        };
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Email or Password is incorrect. Please register.",
            });
        };

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "InCorrect Credentials",
            });
        }
        
        const accessToken = generateAccessToken(user._id);   //generating access token
        const refreshToken = generateRefreshToken(user._id);

        user.refreshToken = refreshToken;  //storing refresh token in db
        await user.save({ validateBeforeSave: false });

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken -otp -otpExpiresAt"
        );

        const isProd = process.env.NODE_ENV === "production";
        const options = {   //sending refresh token in httpOnly cookie
        httpOnly: true,
        secure: isProd, // secure cookies only in production
        sameSite: isProd ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            success: true,
            message: "User logged in successfully",           
            accessToken,
            user: loggedInUser,
        });
    }catch(err){
        console.log("Error Logging User", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
};

export const getUser = async (req, res) => {
    try{
        const userId = req.user?._id;

        if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized user",
        });
        }

        const user = await User.findById( userId ).select(
        "-password -otp -refreshToken"
        );

        if (!user) {
        return res.status(404).json({
            success: false,
            message: "User not found",
        });
        }

        return res.status(200).json({
        success: true,
        message: "User fetched successfully",
        user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
        success: false,
        message: "Error fetching user",
        });
    }
};

export const refreshAccessToken = async(req, res)=>{
    try{
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;    //taking refresh token from httpOnly cookie or from request body

        if(!refreshToken){  //if no refresh token provided
            return res.status(400).json({message: "Refresh Token Missing"});
        }

        const decode = verifyRefreshToken(refreshToken) //if refresh token found verify it

        const user = await User.findById(decode._id).select("-password");   //if valid refresh token get user details from it

        if(!user){    //if no user found for id in refresh token
            return res.status(404).json({message: "User Not Found"});
        }

        const newAccessToken = generateAccessToken(user); //for user found generate new access token
        res.status(200).json({  //& return it in response as of access token
            status: "success",
            accessToken: newAccessToken
        });
    }catch (err){
        res.status(401).json({message: err.message});
    }
};