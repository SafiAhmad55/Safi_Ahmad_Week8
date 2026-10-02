const express = require("express");

const Project = require("../models/Project");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Project and Task Reports
router.get("/", authMiddleware, async (req, res) => {
  try {
    // =========================
    // PROJECT STATISTICS
    // =========================

    const totalProjects = await Project.countDocuments();

    const completedProjects = await Project.countDocuments({
      status: "Completed",
    });

    const activeProjects = await Project.countDocuments({
      status: {
        $in: ["Planning", "In Progress", "On Hold"],
      },
    });

    // =========================
    // TASK STATISTICS
    // =========================

    const totalTasks = await Task.countDocuments();

    const completedTasks = await Task.countDocuments({
      status: "Completed",
    });

    const pendingTasks = await Task.countDocuments({
      status: {
        $in: ["To Do", "In Progress", "Review"],
      },
    });

    // =========================
    // PROJECT PROGRESS
    // =========================

    const projects = await Project.find().select(
      "name status"
    );

    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const totalProjectTasks = await Task.countDocuments({
          project: project._id,
        });

        const completedProjectTasks = await Task.countDocuments({
          project: project._id,
          status: "Completed",
        });

        let progress = 0;

        if (totalProjectTasks > 0) {
          progress = Math.round(
            (completedProjectTasks / totalProjectTasks) * 100
          );
        }

        return {
          projectId: project._id,
          projectName: project.name,
          status: project.status,
          totalTasks: totalProjectTasks,
          completedTasks: completedProjectTasks,
          progress,
        };
      })
    );

    // =========================
    // RESPONSE
    // =========================

    res.status(200).json({
      message: "Reports fetched successfully",

      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },

      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
      },

      projectProgress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
});

module.exports = router;

