import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import otpVerificationTemplate from "../Templates/otpVerificationtemplate.js";

export const sendOtpEmail= async(vendor)=>{
    try{
        const transporter = nodemailer.createTransport({    //configuring nodemailer service
            host: "smtp.gmail.com",
            port : 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const otp = Math.floor(1000 + Math.random()*9000).toString(); //generating 4 digit otp

        vendor.otp = await bcrypt.hash(otp, 10);
        vendor.otpCreatedAt = new Date(); //assigning otp creation time
        vendor.otpExpiresAt = Date.now() + 10 * 60 * 1000; //assigning expiry time
        await vendor.save(); //saving otp in db

        const mailOptions= {
            from: `"InVolv" <${process.env.EMAIL_USER}>`, 
            to : vendor.email,
            subject: "Your OTP for InVolv Store Registration",
            html: otpVerificationTemplate(vendor, otp),
        };

        await transporter.sendMail(mailOptions);

        return{
            success: true,
            message: "OTP email sent successfully",
            otp, //checking 
        };
    }catch(err){
        console.log("Error in sending OTP email", err);
        return {
            success: false,
            message: "Error in sending OTP email",
            error: err.message,
        };
    }
}