const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Project = require("../models/Project");
const Client = require("../models/Client");
const authMiddleware = require("../middleware/auth");

// Create a new project
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      client,
      startDate,
      deadline,
      status,
    } = req.body;

    // Check required fields
    if (!name || !description || !client || !startDate || !deadline) {
      return res.status(400).json({
        message:
          "Name, description, client, start date, and deadline are required.",
      });
    }

    const descriptionWords = description.trim().split(/\s+/);

if (descriptionWords.length > 200) {
  return res.status(400).json({
    message: "Description cannot exceed 200 words.",
  });
}

    // Check if the client exists
    const existingClient = await Client.findById(client);

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    // Check date validation
    if (new Date(deadline) < new Date(startDate)) {
      return res.status(400).json({
        message: "Deadline cannot be before the start date.",
      });
    }

    const project = new Project({
      name,
      description,
      client,
      startDate,
      deadline,
      status,
    });

    const savedProject = await project.save();

    res.status(201).json({
      message: "Project created successfully",
      project: savedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project",
      error: error.message,
    });
  }
});

// Get all projects with search and filtering
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { search, status, client } = req.query;

    let filter = {};

    // Search by project name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by client
    if (client) {
      filter.client = client;
    }

    const projects = await Project.find(filter)
      .populate("client", "name email company")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
});

// Get project details by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({
    message: "Invalid project ID.",
  });
}
    const project = await Project.findById(req.params.id)
      .populate("client", "name email phone company status");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch project",
      error: error.message,
    });
  }
});

// Update a project
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      client,
      startDate,
      deadline,
      status,
    } = req.body;

    // Check required fields
    if (!name || !description || !client || !startDate || !deadline) {
      return res.status(400).json({
        message:
          "Name, description, client, start date, and deadline are required.",
      });
    }
    const descriptionWords = description.trim().split(/\s+/);

if (descriptionWords.length > 200) {
  return res.status(400).json({
    message: "Description cannot exceed 200 words.",
  });
}

    // Check if the client exists
    const existingClient = await Client.findById(client);

    if (!existingClient) {
      return res.status(404).json({
        message: "Client not found.",
      });
    }

    // Check date validation
    if (new Date(deadline) < new Date(startDate)) {
      return res.status(400).json({
        message: "Deadline cannot be before the start date.",
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        client,
        startDate,
        deadline,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("client", "name email phone company status");

    if (!updatedProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.status(200).json({
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update project",
      error: error.message,
    });
  }
});

// Delete a project
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Only Admin can delete projects
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    res.status(200).json({
      message: "Project deleted successfully",
      project: deletedProject,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete project",
      error: error.message,
    });
  }
});

module.exports = router;