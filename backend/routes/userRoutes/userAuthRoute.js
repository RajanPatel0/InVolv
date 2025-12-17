import express from "express";

import { registerUser, verifyUserOtp, loginUser, getUser } from "../../controllers/userControllers/authController.js";
import { userValidateOtpToken } from "../../middlewares/userMiddlewares/userJwtAuth.js";
import { userAuthMiddleware } from "../../middlewares/userMiddlewares/userAuthMiddleware.js" 

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", userValidateOtpToken, verifyUserOtp);
router.post("/login", loginUser);
router.get("/user-profile", userAuthMiddleware, getUser);

export default router;