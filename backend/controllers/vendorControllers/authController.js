import jwt from "jsonwebtoken";
import Vendor from "../../models/StoreModels/vendorModel.js";

import { verifyRefreshToken, generateAccessToken, generateRefreshToken, generateOtpToken, isOtpCorrect} from "../../utils/Tokens/vendorTokens.js";
import { sendOtpEmail } from "../../utils/OTPS/sendOtpEmail.js"
import bcrypt from "bcryptjs";

export const registerVendor= async(req,res)=>{
    try{
        const {storeName, email, phone, password, address, category, location} = req.body;

        const exisitingVendor = await Vendor.findOne({ email });

        if(exisitingVendor){
            return res.status(400).json({
                message: "Email already Registered"
            });
        }

        const newVendor = new Vendor({
            storeName,
            email,
            phone,
            password,
            address,
            category,
            location
        });
        await newVendor.save();

        const otpResult = await sendOtpEmail(newVendor);    //otp sending model after user creation
        if(!otpResult.success){
            return res.status(500).json({
                success: false,
                message: "User Created but OTP sending failed"
            })
        }

        const otpToken= generateOtpToken(newVendor);   //short lived token for otp validity

        res.status(201).json({
            success: true,
            message: "Vendor registered Successfully. OTP sent to email.",
            vendor:{
                id: newVendor._id,
                storeName: newVendor.storeName,
                email: newVendor.email,
                phone: newVendor.phone,
                address: newVendor.address,
                category: newVendor.category,
                location: newVendor.location
            },
            otpToken,   //2fa
        });
    }catch (err){
        console.log("Error registering User", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message,
        })
    }
};

export const verifyOtp = async(req, res)=>{
    try{
        const {otp} = req.body;   //receiving otp via frontend req body

        if(!otp){
            return res.status(400).json({
                message: "OTP is required",
                success: false,
            })
        };

        const vendorId = req.vendor?._id;  //extracting vendor id
        if(!vendorId){
            return res.status(401).json({
                success: false,
                message: "Unauthorized Access: Vendor ID not found",
            })
        };

        const vendor = await Vendor.findById(vendorId); //fetching vendor from vendor id
        if(!vendor  || !vendor.otp || !vendor.otpExpiresAt){
            return res.status(404).json({
                success: false,
                message: "Vendor Not Found or OTP not set",
            })
        };

        const isExpired = Date.now() > new Date(vendor.otpExpiresAt); //checking otp validity
        if(isExpired){
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Request new one",
            })
        };

        const isOtpValid = await  isOtpCorrect(otp, vendor); //comparing otp(entered one with stored otp in vendor db)
        if(!isOtpValid){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            })
        }

        //marking verified & making other related otp fields null
        vendor.isVerified = true;
        vendor.otp = null;
        vendor.otpExpiresAt = null;

        await vendor.save();

        res.status(200).json({
            success: true,
            message: "OTP verified successfully. You can now Login.",
        });
    }catch (err){
        console.log("Error verifying OTP", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message,
        });
    }
};

export const loginVendor = async(req, res)=>{
    try{
        const {email, password}= req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            })
        };

        const vendor = await Vendor.findOne({ email});

        if(!vendor){
            return res.status(404).json({
                success: false,
                message: "Email or Password is incorrect. Please register.",
            });
        };

        if (!vendor.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Your email is not verified. Please verify before logging in.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, vendor.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                success: false,
                message: "InCorrect Credentials",
            });
        }

        const accessToken = generateAccessToken(vendor._id);   //generating access token
        const refreshToken = generateRefreshToken(vendor._id); //generating refresh token

        vendor.refreshToken = refreshToken;  //storing refresh token in db
        await vendor.save({ validateBeforeSave: false });

        const loggedInVendor = await Vendor.findById(vendor._id).select(
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
            message: "Vendor logged in successfully",           
            accessToken,
            vendor: loggedInVendor,
        });

    }catch(err){
        console.log("Error logging in Vendor", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err: err.message
        });
    }
};

export const getVendor = async (req, res) => {
  try {
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized vendor",
      });
    }

    const vendor = await Vendor.findById( vendorId ).select(
      "-password -otp -refreshToken"
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching vendor",
    });
  }
};

// export const getAllVendor = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const vendors = await Vendor.find()
//       .select("-password -otp -refreshToken")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit);

//     const totalVendors = await Vendor.countDocuments();

//     return res.status(200).json({
//       success: true,
//       message: "Vendors fetched successfully",
//       meta: {
//         total: totalVendors,
//         page,
//         limit,
//         totalPages: Math.ceil(totalVendors / limit),
//       },
//       vendors,
//     });
//   } catch (error) {
//     console.error("Error fetching vendors:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error fetching vendors",
//     });
//   }
// };

// Refresh Access Token controller or its endpoint for refreshing the access token using refresh token

export const refreshAccessToken = async(req, res)=>{
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