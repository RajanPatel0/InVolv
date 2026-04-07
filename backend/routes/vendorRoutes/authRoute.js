import express from "express";
import passport from "passport";
import { userValidateOtpToken } from "../../middlewares/jwtAuth.js";
import { registerVendor, verifyOtp, loginVendor, getVendor, refreshAccessToken, googleAuthCallback, completeVendorProfile } from "../../controllers/vendorControllers/authController.js";
import { authMiddleware } from "../../middlewares/vendorMiddlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerVendor);
router.post("/verify-Otp", userValidateOtpToken, verifyOtp);
router.post("/login", loginVendor);
router.get("/profile", authMiddleware, getVendor);
router.post("/refresh-token", refreshAccessToken);

// Google OAuth routes for vendor
router.get("/auth/google", passport.authenticate("google-vendor", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google-vendor", { failureRedirect: "/api/vendor/auth/google/failure" }), googleAuthCallback);

// Complete vendor profile after OAuth
router.post("/complete-profile", authMiddleware, completeVendorProfile);

router.get("/auth/google/failure", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Google authentication failed"
    });
});

export default router;