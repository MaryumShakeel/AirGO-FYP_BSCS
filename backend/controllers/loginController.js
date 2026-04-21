const User = require("../models/User");
const bcrypt = require("bcryptjs");

// LOGIN USER
exports.loginUser = async (req, res) => {
  console.log("LOGIN API HIT");
  console.log(req.body);
  
  try {
    const { email, password } = req.body;

    // ✅ Trim and normalize input
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Find user by normalized email
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Login successful
    return res.status(200).json({ success: true, message: "Login successful" });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};