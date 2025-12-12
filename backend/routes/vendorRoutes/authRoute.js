import express from "express";

import { userValidateOtpToken } from "../../middlewares/jwtAuth.js";
import { registerVendor, verifyOtp, loginVendor } from "../../controllers/vendorControllers/authController.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/verify-Otp", userValidateOtpToken, verifyOtp);
router.post("/login", loginVendor);

export default router;