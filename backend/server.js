// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // MongoDB connection
import authRoutes from "./routes/authRoutes.js";
//import profileRoutes from "./routes/profileController.js";
//import droneRoutes from "./routes/droneRoutes.js"; // existing drone hiring routes
import droneOrderRoutes from "./routes/droneOrderRoutes.js"; // new Drone Order API route
import droneRoutes from "./routes/droneRoutes.js";
import droneControlRoutes from "./routes/droneControlRoutes.js";
import djiRoutes from "./routes/djiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";




dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/drone", droneRoutes);
app.use("/api/drone-control", droneControlRoutes);
app.use("/api/dji", djiRoutes);
app.use("/api/payments", paymentRoutes);



// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use("/api/auth", authRoutes);
//app.use("/api/profile", profileRoutes);
//app.use("/api/drone", droneRoutes); // existing drone features
app.use("/api/droneOrders", droneOrderRoutes); // new Drone Hiring Order route

// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚁 Drone Delivery API is running...");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} 🚀`));
