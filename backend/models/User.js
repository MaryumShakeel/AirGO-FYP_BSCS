const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    cnic: { type: String, required: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    dob: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    
});

module.exports = mongoose.model("User", userSchema);