import express from "express";
import passport from "passport";
import { registerUser, verifyUserOtp, loginUser, getUser, refreshAccessToken, logoutUser, googleAuthCallback } from "../../controllers/userControllers/authController.js";
import { userValidateOtpToken } from "../../middlewares/userMiddlewares/userJwtAuth.js";
import { userAuthMiddleware } from "../../middlewares/userMiddlewares/userAuthMiddleware.js"

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", userValidateOtpToken, verifyUserOtp);
router.post("/login", loginUser);
router.get("/user-profile", userAuthMiddleware, getUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", userAuthMiddleware, logoutUser);

// Google OAuth routes
router.get("/auth/google", passport.authenticate("google-user", { scope: ["profile", "email"] }));
router.get("/auth/google/callback", passport.authenticate("google-user", { failureRedirect: "/api/user/auth/google/failure" }), googleAuthCallback);

router.get("/auth/google/failure", (req, res) => {
    res.status(401).json({
        success: false,
        message: "Google authentication failed"
    });
});

export default router;