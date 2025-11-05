import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "DroneOrder", required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: "Paid" },
  date: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
