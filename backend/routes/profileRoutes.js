// routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// GET profile
router.get("/", profileController.getUserProfile);

// UPDATE profile
router.patch("/", profileController.updateUserProfile);

// CHANGE password
router.post("/changePassword", profileController.changePassword);

module.exports = router;