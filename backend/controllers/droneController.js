// backend/controllers/droneController.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

let accessToken = null;

/**
 * Authenticate with DJI Cloud API using app credentials.
 */
const djiAuthenticate = async () => {
  try {
    const res = await axios.post(`${process.env.DJI_API_URL}/oauth/token`, {
      app_key: process.env.DJI_APP_KEY,
      app_secret: process.env.DJI_APP_SECRET,
      grant_type: "client_credentials",
    });

    accessToken = res.data.access_token;
    console.log("✅ DJI Cloud API authenticated successfully");
    return accessToken;
  } catch (err) {
    console.error("❌ DJI authentication failed:", err.response?.data || err.message);
    throw new Error("DJI authentication failed");
  }
};

/**
 * Ensure valid access token
 */
const ensureToken = async () => {
  if (!accessToken) {
    await djiAuthenticate();
  }
  return accessToken;
};

/**
 * Start a real drone mission (pickup → dropoff)
 */
export const startDroneDelivery = async (req, res) => {
  try {
    const { pickup, dropoff } = req.body;

    if (!pickup || !dropoff) {
      return res.status(400).json({
        success: false,
        message: "Pickup and dropoff coordinates are required.",
      });
    }

    const token = await ensureToken();

    // Define a short demo mission route
    const missionData = {
      name: "University_Drone_Delivery",
      waypoints: [
        { latitude: pickup.lat, longitude: pickup.lng, altitude: 15 },
        { latitude: dropoff.lat, longitude: dropoff.lng, altitude: 15 },
      ],
      speed: 5, // meters per second
      action_on_finish: "auto_land", // lands after drop-off
    };

    // Create mission
    const createMission = await axios.post(
      `${process.env.DJI_API_URL}/v1/missions/create`,
      missionData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const missionId = createMission.data.mission_id;
    console.log("✅ Mission created:", missionId);

    // Start mission
    const startMission = await axios.post(
      `${process.env.DJI_API_URL}/v1/missions/${missionId}/start`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("🚁 Drone mission started:", startMission.data);

    res.json({
      success: true,
      message: "Drone delivery mission started successfully!",
      missionId,
      response: startMission.data,
    });
  } catch (err) {
    console.error("❌ Drone mission error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Drone mission failed.",
      error: err.response?.data || err.message,
    });
  }
};
