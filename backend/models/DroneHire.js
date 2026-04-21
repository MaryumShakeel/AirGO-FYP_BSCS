const mongoose = require("mongoose");

const droneHireSchema = new mongoose.Schema({

    pickupAddress: {
        type: String,
        required: true
    },

    dropOffAddress: {
        type: String,
        required: true
    },

    pickupLat: Number,
    pickupLng: Number,

    dropLat: Number,
    dropLng: Number,

    itemName: String,
    itemWeight: Number,

    distanceKm: Number,
    estimatedTime: Number,
    deliveryCost: Number,

    paymentStatus: {
        type: String,
        default: "PAID"
    },

    orderStatus: {
        type: String,
        default: "PENDING"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("DroneHire", droneHireSchema);