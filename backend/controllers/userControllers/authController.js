import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../../models/UserModels/userModel.js";
import { parseExpiryToMs } from "../../utils/helpers.js";
import dotenv from "dotenv";

dotenv.config();

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
            if(!otpResult.success){ // If OTP sending fails, delete the created user and return error
                await User.findByIdAndDelete(newUser._id);   // rollback
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

        user.isVerified = true; // Mark user as verified
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

        if(!user.isVerified){
            return res.status(403).json({
                success: false,
                message: "Your email is not verified. Please verify before logging in.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "InCorrect Credentials",
            });
        }
        
        const accessToken = generateAccessToken(user);   //generating access token with user object
        const refreshToken = generateRefreshToken(user);

        // After generating refreshToken
        user.refreshTokens.push(refreshToken);
        await user.save();
        
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshTokens -otp -otpExpiresAt"
        );

        const accessTokenMaxAge = parseExpiryToMs(process.env.ACCESS_TOKEN_EXPIRY);
        const refreshTokenMaxAge = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRY);

        const isProd = process.env.NODE_ENV === "production";
        const accessOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: accessTokenMaxAge,
        };
        const refreshOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: refreshTokenMaxAge,
        };

        return res
        .status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
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
        "-password -otp -refreshTokens"
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
        console.log("[REFRESH TOKEN] Request received");

        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        
        if(!refreshToken){
            console.error("[REFRESH TOKEN] No refresh token found");
            return res.status(401).json({
                success: false,
                message: "Refresh Token Missing"
            });
        }


        const decode = verifyRefreshToken(refreshToken);
        
        const user = await User.findById(decode.id);

        if(!user){
            console.error("[REFRESH TOKEN] User not found");
            return res.status(401).json({
                success: false, 
                message: "User Not Found"
            });
        }

        if(!user.refreshTokens.includes(refreshToken)){
            console.error("[REFRESH TOKEN] Invalid refresh token doesn't match stored token");
            return res.status(401).json({
                success: false, 
                message: "Invalid refresh token"
            });
        }


        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Rotate refresh token in DB
        user.refreshTokens = user.refreshTokens.map(t =>
            t === refreshToken ? newRefreshToken : t
        );
        await user.save();

        const accessTokenMaxAge = parseExpiryToMs(process.env.ACCESS_TOKEN_EXPIRY);
        const refreshTokenMaxAge = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRY);
        // Define cookie options (same as in login)
        const isProd = process.env.NODE_ENV === "production";
        const accessOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: accessTokenMaxAge,
        };
        const refreshOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: refreshTokenMaxAge,
        };

        console.log("[REFRESH TOKEN] Tokens refreshed successfully");

        // Set new cookies
        return res
            .status(200)
            .cookie("accessToken", newAccessToken, accessOptions)
            .cookie("refreshToken", newRefreshToken, refreshOptions)
            .json({
                success: true,
                status: "success",
                message: "Access token refreshed successfully",
                accessToken: newAccessToken,
                timestamp: new Date().toISOString()
            });
    }catch(err){
        console.error("[REFRESH TOKEN] Error during token refresh:", err);
        return res.status(401).json({
            success: false,
            message: "Unauthorized: " + err.message,
            error: err.message
        });
    }   
};

export const logoutUser = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not found"
            });
        }

        // Clear refresh token from database
        // Remove the specific refresh token
        await User.findByIdAndUpdate(userId, {
            $pull: { refreshTokens: req.cookies.refreshToken }
        });

        // Clear cookies
        const isProd = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
        };

        return res
            .status(200)
            .clearCookie("accessToken", cookieOptions)
            .clearCookie("refreshToken", cookieOptions)
            .json({
                success: true,
                message: "User logged out successfully"
            });
    } catch (error) {
        console.error("Error logging out:", error);
        return res.status(500).json({
            success: false,
            message: "Error logging out"
        });
    }
};

// Google OAuth Callback Handler
export const googleAuthCallback = async (req, res) => {
    try {
        let user = req.user;

        if (!user || !user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed"
            });
        }

        // Fetch fresh user from database to ensure all fields are present
        user = await User.findById(user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Ensure refreshTokens array is initialized
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token
        user.refreshTokens.push(refreshToken);
        await user.save();

        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshTokens -otp -otpExpiresAt"
        );

        const accessTokenMaxAge = parseExpiryToMs(process.env.ACCESS_TOKEN_EXPIRY);
        const refreshTokenMaxAge = parseExpiryToMs(process.env.REFRESH_TOKEN_EXPIRY);

        const isProd = process.env.NODE_ENV === "production";
        const accessOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: accessTokenMaxAge,
        };
        const refreshOptions = {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'None' : 'Lax',
            maxAge: refreshTokenMaxAge,
        };

        // Redirect to frontend with tokens
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res
            .cookie("accessToken", accessToken, accessOptions)
            .cookie("refreshToken", refreshToken, refreshOptions)
            .redirect(`${frontendUrl}/auth/oauth-success?token=${accessToken}&userId=${user._id}`);

    } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/auth/oauth-error?message=${error.message}`);
    }
};