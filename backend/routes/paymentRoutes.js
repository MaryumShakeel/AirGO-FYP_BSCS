import express from "express";
import Payment from "../models/Payment.js";
import DroneOrder from "../models/DroneOrder.js";

const router = express.Router();

// POST /api/payments/create
router.post("/create", async (req, res) => {
  try {
    const { userId, amount, deliveryId, cardDetails } = req.body;

    // Basic validation (mock check)
    const isCardValid = cardDetails && cardDetails.number.length === 16;
    if (!isCardValid) return res.status(400).json({ message: "Invalid card details" });

    // Save payment record
    const payment = new Payment({
      userId,
      deliveryId,
      amount,
      status: "Paid",
      date: new Date(),
    });
    await payment.save();

    // Update DroneOrder status to “Paid”
    await DroneOrder.findByIdAndUpdate(deliveryId, { status: "Paid" });

    res.status(200).json({
      message: "Payment successful",
      receipt: {
        receiptId: payment._id,
        amount,
        paidOn: payment.date,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
});

export default router;
