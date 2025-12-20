import express from "express";
const router = express.Router();
import { signup,login,verifyMail,logout,resendOTP,forgotPassword,resetPassword,verifyOTP,googleLogin } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-mail", verifyMail);
router.post("/google-login", googleLogin);
router.post("/logout", auth, logout);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
