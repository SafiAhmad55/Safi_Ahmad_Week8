const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// Create a new task
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedEmployee,
      priority,
      dueDate,
      status,
    } = req.body;

    // Check required fields
    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({
        message: "Title, description, project, and due date are required.",
      });
    }

    // Check if project ID is valid
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    // Check if project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }
     // Check due date
      if (new Date(dueDate) < new Date()) {
        return res.status(400).json({
        message: "Due date cannot be in the past.",
        });
       }
    // Check assigned employee if provided
    if (assignedEmployee) {
      if (!mongoose.Types.ObjectId.isValid(assignedEmployee)) {
        return res.status(400).json({
          message: "Invalid employee ID.",
        });
      }

      const employee = await User.findOne({
        _id: assignedEmployee,
        role: "Employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found.",
        });
      }
    }

    // Check due date
    if (new Date(dueDate) < new Date()) {
      return res.status(400).json({
        message: "Due date cannot be in the past.",
      });
    }

    const task = new Task({
      title,
      description,
      project,
      assignedEmployee: assignedEmployee || null,
      priority,
      dueDate,
      status,
    });

    const savedTask = await task.save();

    const populatedTask = await Task.findById(savedTask._id)
      .populate("project", "name description status")
      .populate("assignedEmployee", "username email role");

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
});

// Get all tasks with search and filtering
router.get("/", authMiddleware, async (req, res) => {
  try {
    const {
      search,
      project,
      assignedEmployee,
      priority,
      status,
    } = req.query;

    let filter = {};

    // Search by task title
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by project
    if (project) {
      filter.project = project;
    }

    // Filter by employee
    if (assignedEmployee) {
      filter.assignedEmployee = assignedEmployee;
    }

    // Filter by priority
    if (priority) {
      filter.priority = priority;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name description status")
      .populate("assignedEmployee", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
});
// Update task status for Kanban Board
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    // Check task ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    // Allowed Kanban statuses
    const allowedStatuses = [
      "To Do",
      "In Progress",
      "Review",
      "Completed",
    ];

    // Validate status
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status.",
        allowedStatuses,
      });
    }

    // Find and update task
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("project", "name description status")
      .populate("assignedEmployee", "username email role");

    // Check if task exists
    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task status",
      error: error.message,
    });
  }
});
// Get task details by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const task = await Task.findById(req.params.id)
      .populate("project", "name description status")
      .populate("assignedEmployee", "username email role");

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task fetched successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch task",
      error: error.message,
    });
  }
});

// Update a task
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const {
      title,
      description,
      project,
      assignedEmployee,
      priority,
      dueDate,
      status,
    } = req.body;

    // Check required fields
    if (!title || !description || !project || !dueDate) {
      return res.status(400).json({
        message: "Title, description, project, and due date are required.",
      });
    }

    // Check project
    if (!mongoose.Types.ObjectId.isValid(project)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Check assigned employee
    if (assignedEmployee) {
      if (!mongoose.Types.ObjectId.isValid(assignedEmployee)) {
        return res.status(400).json({
          message: "Invalid employee ID.",
        });
      }

      const employee = await User.findOne({
        _id: assignedEmployee,
        role: "Employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Employee not found.",
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        project,
        assignedEmployee: assignedEmployee || null,
        priority,
        dueDate,
        status,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("project", "name description status")
      .populate("assignedEmployee", "username email role");

    if (!updatedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
});

// Delete a task
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Only Admin can delete tasks
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Admins only.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid task ID.",
      });
    }

    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      task: deletedTask,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
});

module.exports = router;