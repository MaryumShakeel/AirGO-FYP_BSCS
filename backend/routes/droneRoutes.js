// backend/routes/droneRoutes.js
import express from "express";
import { startDroneDelivery } from "../controllers/droneController.js";

const router = express.Router();

// POST /api/drone/start
router.post("/start", startDroneDelivery);

export default router;
