const express = require("express");
const router = express.Router();

const droneHireController = require("../controllers/droneHireController");

router.post("/create", droneHireController.createOrder);

// route for history
router.get("/all", droneHireController.getAllOrders);

module.exports = router;