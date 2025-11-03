// models/DroneOrder.js
import mongoose from "mongoose";


const droneOrderSchema = new mongoose.Schema(
  {
    pickupLocation: {
      type: String,
      required: true,
    },
    dropoffLocation: {
      type: String,
      required: true,
    },
    pickupCoords: {
      type: [Number], // [latitude, longitude]
      required: true,
    },
    dropoffCoords: {
      type: [Number],
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    itemWeight: {
      type: Number,
      required: true,
    },
    itemDimensions: {
      type: String,
    },
    specialInstructions: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online"],
      default: "Cash",
    },
    estimatedFee: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Transit", "Delivered"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const DroneOrder = mongoose.model("DroneOrder", droneOrderSchema);

export default DroneOrder;
