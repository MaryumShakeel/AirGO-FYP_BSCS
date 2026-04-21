const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");

// REGISTER USER
exports.registerUser = async (req, res) => {
    console.log("REGISTER API HIT");
    console.log(req.body);
    
    try {
        const { username, email, phone, cnic, dob, city, password } = req.body;

        if (!username || !email || !cnic || !password || !city || !dob || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Check OTP verified
        const otpRecord = await Otp.findOne({ phone });
        if (!otpRecord || !otpRecord.verified) {
            return res.status(400).json({ message: "Phone not verified" });
        }

        // ✅ Check if user exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // ✅ Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create new user
        const newUser = new User({
            username,
            email,
            phone,
            cnic,
            dob,
            city,
            password: hashedPassword,
        });

        await newUser.save();

        // ✅ Optionally delete OTP record after registration
        await Otp.deleteOne({ phone });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};