import express from "express";

const router = express.Router();

// Simulated drone telemetry data
let dronePosition = {
  latitude: 33.613954,   // start point (your university)
  longitude: 73.199972,
  battery: 85,
  speed: 10,
  status: "In Transit",
};

// Move slightly each time frontend requests
router.get("/telemetry", (req, res) => {
  // simulate small movement for demo
  dronePosition.latitude += (Math.random() - 0.5) * 0.0005;
  dronePosition.longitude += (Math.random() - 0.5) * 0.0005;
  dronePosition.battery = Math.max(0, dronePosition.battery - 0.2);

  if (dronePosition.battery < 15) dronePosition.status = "Landing";

  res.json(dronePosition);
});

export default router;
