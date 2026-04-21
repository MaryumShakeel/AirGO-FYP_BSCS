const DroneHire = require("../models/DroneHire");

exports.createOrder = async (req, res) => {

    try {

        const {
            pickupAddress,
            dropOffAddress,
            pickupLat,
            pickupLng,
            dropLat,
            dropLng,
            itemName,
            itemWeight,
            distanceKm,
            estimatedTime,
            deliveryCost
        } = req.body;

        const order = new DroneHire({
            pickupAddress,
            dropOffAddress,
            pickupLat,
            pickupLng,
            dropLat,
            dropLng,
            itemName,
            itemWeight,
            distanceKm,
            estimatedTime,
            deliveryCost
        });

        await order.save();

        res.status(201).json({
            success: true,
            message: "Drone order created",
            order
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create order"
        });

    }

};

// GET all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await DroneHire.find().sort({ createdAt: -1 }); // newest first
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};