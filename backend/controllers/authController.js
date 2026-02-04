import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import validator from 'validator';
import nodemailer from "nodemailer";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.WEB_CLIENT_ID);

// Helper function to generate OTP and send email
const sendOTPEmail = async (email, subject, text) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text.replace('{otp}', otp), // Replace {otp} placeholder with actual OTP
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

// Signup controller
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ msg: "Invalid email format" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate and send OTP email
    const otp = await sendOTPEmail(
      email,
      "Verify your email - ToothAid",
      "Your OTP is {otp}. It is valid for 10 minutes."
    );

    user = new User({ name, email, password: hashedPassword, otp, otpExpires: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 mins
    await user.save();

    res.status(201).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify Mail controller
export const verifyMail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.verified)
      return res.status(400).json({ msg: "User already verified" });

    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });

    if (user.otpExpires < new Date())
      return res.status(400).json({ msg: "OTP expired" });

    user.verified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Google Login controller
export const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    // 1. Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name , picture, sub} = payload;
    console.log("Google Payload:", payload);
    // 2. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      // 3. If not, register them automatically
      user = new User({
        name,
        email,
        password: "Google", // No password for Google users
        verified: true // Google emails are already verified
      });
      await user.save();
    }
    // 4. Generate JWT
    const jwtToken = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({
      message: "Google Login Success",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
    console.log(res.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Check if verified – front end can redirect to OTP screen based on this
    if (!user.verified) {
      const otp = await sendOTPEmail(user.email, "Verify your email - ToothAid", "Your OTP is {otp}. It is valid for 10 minutes.");
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000;
      await user.save();
      return res.status(400).json({
        msg: "Email not verified",
        requiresVerification: true,
        email: user.email,
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout controller
export const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    user.token = undefined;
    await user.save();
    console.log("Logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Resend OTP controller
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const otp = await sendOTPEmail(email, "Resend OTP for ToothAid", "Your OTP is {otp}. It is valid for 10 minutes.");
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Forgot Password controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const otp = await sendOTPEmail(email, "Password Reset OTP for ToothAid", "Your OTP is {otp}. It is valid for 10 minutes.");
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset Password controller
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Successful - ToothAid",
    text: "Your password has been reset successfully.",
  };
  
  await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify OTP controller
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.otp !== otp)
      return res.status(400).json({ msg: "Invalid OTP" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ msg: "OTP expired" });


    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};