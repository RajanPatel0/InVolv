import express from "express";

import { registerVendor, verifyOtp } from "../../controllers/vendorControllers/authController.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/verify-Otp", verifyOtp)
// router.post("/login", loginVendor);

export default router;