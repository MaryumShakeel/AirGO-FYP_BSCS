// routes/droneControlRoutes.js
import express from "express";
import axios from "axios";
import { connectDrone, performDelivery } from "../utils/djiController.js";

const router = express.Router();

/**
 * @route   GET /api/drone/connect
 * @desc    Connects the drone using DJI Cloud API
 */
router.get("/connect", async (req, res) => {
  try {
    const ok = await connectDrone();
    if (ok) {
      res.json({ message: "Drone connected successfully" });
    } else {
      res.status(500).json({ message: "Drone connection failed" });
    }
  } catch (err) {
    console.error("Error connecting drone:", err);
    res.status(500).json({ message: "Drone connection error", error: err.message });
  }
});

/**
 * @route   POST /api/drone/deliver
 * @desc    Performs pickup and drop-off delivery
 * @body    { pickupCoords: { lat, lng }, dropoffCoords: { lat, lng } }
 */
router.post("/deliver", async (req, res) => {
  try {
    const { pickupCoords, dropoffCoords } = req.body;

    if (!pickupCoords || !dropoffCoords) {
      return res.status(400).json({ message: "Coordinates required" });
    }

    const result = await performDelivery(pickupCoords, dropoffCoords);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (err) {
    console.error("Error during delivery:", err);
    res.status(500).json({ message: "Delivery failed", error: err.message });
  }
});

/**
 * @route   GET /api/drone/telemetry
 * @desc    Fetch live telemetry (location, altitude, battery, etc.)
 */
router.get("/telemetry", async (req, res) => {
  try {
    const response = await axios.get("https://api.dji.com/v1/live/telemetry", {
      headers: { Authorization: `Bearer ${process.env.DJI_ACCESS_TOKEN}` },
    });

    res.json(response.data);
  } catch (err) {
    console.error("Telemetry fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
