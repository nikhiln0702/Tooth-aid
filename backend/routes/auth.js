import express from "express";
const router = express.Router();
import { signup,login,verifyOTP,logout } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/logout", auth, logout);

export default router;
