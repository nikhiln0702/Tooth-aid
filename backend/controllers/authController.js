import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from "../models/User.js";
import validator from 'validator';
import nodemailer from "nodemailer";

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

    user = new User({ name, email, password: hashedPassword , otp, otpExpires: Date.now() + 10 * 60 * 1000 }); // OTP valid for 10 mins
    await user.save();

    res.status(201).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyOTP = async (req, res) => {
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
    const token = jwt.sign({ id: user._id,name:user.name }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try{
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

