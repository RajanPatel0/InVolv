import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import userOtpTemplate from "../Templates/userOtptemplate.js";

export const sendUserOtpEmail= async(user)=>{
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

        user.otp = await bcrypt.hash(otp, 10);
        user.otpCreatedAt = new Date(); //assigning otp creation time
        user.otpExpiresAt = Date.now() + 10 * 60 * 1000; //assigning expiry time
        await user.save(); //saving otp in db

        const mailOptions= {
            from: `"InVolv" <${process.env.EMAIL_USER}>`, 
            to : user.email,
            subject: "Your OTP for InVolv Registration",
            html: userOtpTemplate(user, otp),
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