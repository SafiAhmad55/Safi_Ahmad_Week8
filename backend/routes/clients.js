const express = require("express");
const router = express.Router();

const Client = require("../models/Client");
const authMiddleware = require("../middleware/auth");

// Get all clients
router.get("/", authMiddleware, async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Clients fetched successfully",
      clients,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
});

module.exports = router;