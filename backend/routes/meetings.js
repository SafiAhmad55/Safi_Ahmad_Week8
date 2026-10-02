const express = require("express");
const mongoose = require("mongoose");
const Meeting = require("../models/Meeting");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

// CREATE MEETING
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      project,
      date,
      time,
      participants,
      status,
      notes,
    } = req.body;

    if (!title || !project || !date || !time) {
      return res.status(400).json({
        message: "Title, project, date, and time are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const meeting = new Meeting({
      title,
      project,
      date,
      time,
      participants,
      status,
      notes,
    });

    const savedMeeting = await meeting.save();

    res.status(201).json(savedMeeting);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create meeting",
      error: error.message,
    });
  }
});

// GET ALL MEETINGS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("project", "name")
      .populate("participants", "username email")
      .sort({ date: 1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch meetings",
      error: error.message,
    });
  }
});

// GET SINGLE MEETING
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid meeting ID",
      });
    }

    const meeting = await Meeting.findById(id)
      .populate("project", "name")
      .populate("participants", "username email");

    if (!meeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch meeting",
      error: error.message,
    });
  }
});

// UPDATE MEETING
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid meeting ID",
      });
    }

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("project", "name")
      .populate("participants", "username email");

    if (!updatedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json(updatedMeeting);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update meeting",
      error: error.message,
    });
  }
});

// DELETE MEETING
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid meeting ID",
      });
    }

    const deletedMeeting = await Meeting.findByIdAndDelete(id);

    if (!deletedMeeting) {
      return res.status(404).json({
        message: "Meeting not found",
      });
    }

    res.json({
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete meeting",
      error: error.message,
    });
  }
});

module.exports = router;