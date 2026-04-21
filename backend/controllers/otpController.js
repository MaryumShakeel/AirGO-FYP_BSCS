const Otp = require("../models/Otp");

// Generate random 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// SEND OTP
exports.sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        const otp = generateOtp();
        const expiryTime = new Date(Date.now() + 60 * 1000); // 1 minutes

        await Otp.findOneAndUpdate(
            { phone },
            { otp, expiryTime, attempts: 0, verified: false },
            { upsert: true, new: true }
        );

        console.log(`OTP for ${phone}: ${otp}`);

        res.status(200).json({
            message: "OTP sent successfully",
            otp  // ⚠️ For testing only (remove in production)
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// VERIFY OTP
exports.verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const record = await Otp.findOne({ phone });

        if (!record) return res.status(400).json({ message: "OTP not found" });

        if (new Date(record.expiryTime) < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        if (record.attempts >= 3) {
            return res.status(400).json({ message: "Too many attempts" });
        }

        // Convert both to string just in case
        if (String(record.otp) !== String(otp)) {
            record.attempts += 1;
            await record.save();
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // ✅ Mark verified
        record.verified = true;
        await record.save();

        res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error });
    }
};