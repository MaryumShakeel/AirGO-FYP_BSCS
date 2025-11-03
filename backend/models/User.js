import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cnicNumber: { type: String, required: true, unique: true },
  cnicImage: { type: String, required: true },
  countryCode: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  dob: { type: String, required: true },
  educationLevel: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);


