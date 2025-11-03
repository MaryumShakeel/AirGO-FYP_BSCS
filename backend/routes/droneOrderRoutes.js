// routes/droneOrderRoutes.js
import express from "express";
import DroneOrder from "../models/DroneOrder.js";

const router = express.Router();

// @route   POST /api/droneOrders
// @desc    Create a new drone order
router.post("/", async (req, res) => {
  try {
    const {
      pickupLocation,
      dropoffLocation,
      pickupCoords,
      dropoffCoords,
      itemName,
      itemWeight,
      itemDimensions,
      specialInstructions,
      paymentMethod,
      estimatedFee,
    } = req.body;

    if (
      !pickupLocation ||
      !dropoffLocation ||
      !pickupCoords ||
      !dropoffCoords ||
      !itemName ||
      !itemWeight ||
      !estimatedFee
    ) {
      return res.status(400).json({ message: "All required fields must be provided." });
    }

    const newOrder = new DroneOrder({
      pickupLocation,
      dropoffLocation,
      pickupCoords,
      dropoffCoords,
      itemName,
      itemWeight,
      itemDimensions,
      specialInstructions,
      paymentMethod,
      estimatedFee,
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Drone order created successfully.",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating drone order:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// @route   GET /api/droneOrders
// @desc    Get all drone orders (for admin/testing)
router.get("/", async (req, res) => {
  try {
    const orders = await DroneOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
});

export default router;
