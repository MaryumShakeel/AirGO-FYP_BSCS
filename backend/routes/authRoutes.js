// routes/authRoutes.js
import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOTPEmail } from "../utils/mail.js";

const router = express.Router();

// -------------------- Multer setup for CNIC image upload --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// -------------------- OTP in-memory store --------------------
const otpStore = {}; // { email: { otp, expires, verified } }

// -------------------- Verify JWT Middleware --------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token is not valid" });
  }
};

// -------------------- Step 0: Check CNIC & Phone uniqueness --------------------
router.post("/check-unique", async (req, res) => {
  try {
    const { cnicNumber, phone } = req.body;
    const errors = {};

    if (cnicNumber) {
      const existingCnic = await User.findOne({ cnicNumber });
      if (existingCnic) errors.cnicNumber = "This CNIC is already registered.";
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) errors.phone = "This phone number is already registered.";
    }

    if (Object.keys(errors).length > 0) return res.json({ success: false, errors });
    return res.json({ success: true });
  } catch (err) {
    console.error("Check Unique Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// -------------------- Step 1: Send OTP --------------------
router.post("/send-otp", async (req, res) => {
  try {
    console.log("/send-otp route hit!", req.body);

    const { email } = req.body;

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      console.log("Invalid email format:", email);
      return res.status(400).json({ errors: { email: "Enter a valid email" } });
    }

    // check if already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email);
      return res.status(400).json({ errors: { email: "This email is already registered" } });
    }

    // generate otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = {
      otp,
      expires: Date.now() + 60 * 1000, 
      verified: false,
    };

    console.log(`Generated OTP ${otp} for ${email}`);

    // send the email
    try {
      await sendOTPEmail(email, otp);
      console.log(`OTP email sent successfully to ${email}`);
      return res.json({ message: "OTP sent successfully" });
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (err) {
    console.error("OTP Send Route Error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// -------------------- Step 2: Verify OTP --------------------
router.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!email || !otp) return res.status(400).json({ errors: { email: "Email and OTP required" } });
    if (!record) return res.status(400).json({ errors: { otp: "OTP not requested" } });
    if (record.expires < Date.now()) {
      // remove expired record
      delete otpStore[email];
      return res.status(400).json({ errors: { otp: "OTP expired" } });
    }
    if (record.otp !== otp) return res.status(400).json({ errors: { otp: "Invalid OTP" } });

    record.verified = true;
    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Account exists on this email, try different email" });
  }
});

// -------------------- Step 3: Register User --------------------
router.post("/register", upload.single("cnicImage"), async (req, res) => {
  try {
    const {
      fullName,
      fatherName,
      email,
      password,
      cnicNumber,
      country,
      city,
      countryCode,
      phone,
      dob,
      educationLevel,
    } = req.body;

    // Field validation
    if (!email || !password || !fullName || !cnicNumber || !phone)
      return res.status(400).json({ message: "Missing required fields" });

    // Prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Ensure OTP verified
    const otpRecord = otpStore[email];
    if (!otpRecord || !otpRecord.verified)
      return res.status(400).json({
        message: "Please verify your email before registering",
      });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user
    const newUser = new User({
      fullName,
      fatherName,
      email,
      password: hashedPassword,
      cnicNumber,
      cnicImage: req.file?.filename || "",
      country,
      city,
      countryCode,
      phone,
      dob,
      educationLevel,
    });

    await newUser.save();

    // Clean up OTP after success
    delete otpStore[email];

    console.log(`New user registered: ${email}`);
    res.status(201).json({ message: "🎉 Account created successfully!" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ errors: { email: "Email & password required" } });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errors: { email: "No account found with this email" } });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ errors: { password: "Incorrect password" } });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: "7d" });

    return res.json({ message: "Login successful", user, token });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------------------- CHANGE PASSWORD --------------------
// Secure route: user must send Authorization: Bearer <token>
// Body: { currentPassword, newPassword }
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    // Optional: enforce password policy
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Optionally, you can invalidate tokens here if you have a token blacklist / rotate tokens.
    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error while changing password" });
  }
});

// -------------------- GET PROFILE --------------------
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(
      "fullName fatherName email phone cnicNumber country city dob educationLevel cnicImage"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ADDRESSES CRUD

// Get all addresses
router.get("/addresses", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.addresses);
  } catch (err) {
    console.error("Fetch addresses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new address
router.post("/addresses", verifyToken, async (req, res) => {
  try {
    const { label, address } = req.body;
    if (!label || !address)
      return res.status(400).json({ message: "Label and address required" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses.push({ label, address });
    await user.save();

    res.status(201).json(user.addresses);
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update address
router.put("/addresses/:addressId", verifyToken, async (req, res) => {
  try {
    const { label, address } = req.body;
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    addr.label = label || addr.label;
    addr.address = address || addr.address;
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete address
router.delete("/addresses/:addressId", verifyToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== addressId
    );
    await user.save();

    res.json(user.addresses);
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// -------------------- GET ALL REGISTERED USERS (for admin) --------------------
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); // newest first
    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});



export default router;