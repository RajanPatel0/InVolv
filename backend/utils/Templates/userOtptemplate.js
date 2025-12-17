const userOtpTemplate = (user, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
      <p>Hi <strong>${user.fullName || "User"}</strong>,</p>
      <p>Greetings from InVolv!</p>
      <p>Thank you for registering with InVolv.</p>
      <p>Your Password: <strong>${user.password.toString()}</strong></p>
      <p>Please use the OTP below to verify your email address:</p>

      <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="letter-spacing: 2px;">${otp}</h1>
        <p style="color: #555;">(Valid for 10 minutes)</p>
      </div>

      <p>If you did not initiate this request, please ignore this email.</p>

      <p style="margin-top: 40px;">Best regards,<br><strong>InVolv Team</strong></p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply.</p>
    </div>
  `;
};

export default userOtpTemplate;
