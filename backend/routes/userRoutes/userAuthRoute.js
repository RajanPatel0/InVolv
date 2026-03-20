import express from "express";

import { registerUser, verifyUserOtp, loginUser, getUser, refreshAccessToken, logoutUser } from "../../controllers/userControllers/authController.js";
import { userValidateOtpToken } from "../../middlewares/userMiddlewares/userJwtAuth.js";
import { userAuthMiddleware } from "../../middlewares/userMiddlewares/userAuthMiddleware.js" 

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", userValidateOtpToken, verifyUserOtp);
router.post("/login", loginUser);
router.get("/user-profile", userAuthMiddleware, getUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", userAuthMiddleware, logoutUser);

export default router;