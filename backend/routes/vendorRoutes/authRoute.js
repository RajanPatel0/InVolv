import express from "express";

import { userValidateOtpToken } from "../../middlewares/jwtAuth.js";
import { registerVendor, verifyOtp, loginVendor, getVendor } from "../../controllers/vendorControllers/authController.js";
import { authMiddleware } from "../../middlewares/vendorMiddlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/verify-Otp", userValidateOtpToken, verifyOtp);
router.post("/login", loginVendor);
router.get("/profile", authMiddleware, getVendor);

export default router;