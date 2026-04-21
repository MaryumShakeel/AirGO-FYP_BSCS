require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");

const otpRoutes = require("./routes/otpRoutes");
const authRoutes = require("./routes/auth");
const loginRoutes = require("./routes/loginRoutes");
const profileRoutes = require("./routes/profileRoutes");
const droneHireRoutes = require("./routes/droneHireRoutes");

const app = express();

app.use(express.json());

// Routes
app.use("/api/otp", otpRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", loginRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/dronehire", droneHireRoutes);


// ================= AI STATE =================
let latestAIAction = "NORMAL";

async function fetchAIAction() {
    try {
        const res = await axios.get("http://localhost:5001/action");
        latestAIAction = res.data.status;
    } catch (err) {
        console.log("AI fetch error:", err.message);
    }
}

// poll AI every 300ms (REAL-TIME BEHAVIOR)
setInterval(fetchAIAction, 300);


// ================= DRONE CONTROL =================
setInterval(() => {

    if (latestAIAction === "SLOW_DOWN") {
        console.log("🚁 DRONE: slowing down");
        // DroneMissionManager.slowDown()

    } else if (latestAIAction === "MOVE_UP") {
        console.log("🚁 DRONE: moving up");
        // DroneMissionManager.moveUp()

    } else {
        console.log("🚁 DRONE: normal flight");
    }

}, 300);


// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});