const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const fs = require("fs");
const router = express.Router();

const File = require("../models/File");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/auth");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Allowed file types
const allowedTypes = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".zip",
];

// File validation
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(extension)) {
    return cb(
      new Error(
        "Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, ZIP."
      )
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Upload a file to a project
router.post(
  "/upload",
  authMiddleware,
  (req, res) => {
    upload.single("file")(req, res, async (error) => {
      try {
        // Handle Multer errors
        if (error) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "File size cannot exceed 10 MB.",
            });
          }

          return res.status(400).json({
            message: error.message,
          });
        }

        const { project } = req.body;

        // Check file
        if (!req.file) {
          return res.status(400).json({
            message: "Please select a file to upload.",
          });
        }

        // Check project ID
        if (!project || !mongoose.Types.ObjectId.isValid(project)) {
          return res.status(400).json({
            message: "Valid project ID is required.",
          });
        }

        // Check whether project exists
        const existingProject = await Project.findById(project);

        if (!existingProject) {
          return res.status(404).json({
            message: "Project not found.",
          });
        }

        // Save file information in MongoDB
        const newFile = new File({
          fileName: req.file.originalname,
          filePath: req.file.path,
          project: project,
          uploadedBy: req.user.id,
        });

        const savedFile = await newFile.save();

        res.status(201).json({
          message: "File uploaded successfully.",
          file: savedFile,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to upload file.",
          error: error.message,
        });
      }
    });
  }
);
// Get all files for a project
router.get("/project/:projectId", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate project ID
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    // Check whether project exists
    const existingProject = await Project.findById(projectId);

    if (!existingProject) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    // Get files belonging to the project
    const files = await File.find({ project: projectId })
      .populate("uploadedBy", "username email role")
      .populate("project", "name")
      .sort({ uploadDate: -1 });

    res.status(200).json({
      message: "Files fetched successfully.",
      files,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch files.",
      error: error.message,
    });
  }
});
// View a file in the browser
router.get("/view/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid file ID.",
      });
    }

    // Find file
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        message: "File not found.",
      });
    }

    // Open file in browser
    res.sendFile(path.resolve(file.filePath));
  } catch (error) {
    res.status(500).json({
      message: "Failed to view file.",
      error: error.message,
    });
  }
});
// Download a file
router.get("/download/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid file ID.",
      });
    }

    // Find file in database
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        message: "File not found.",
      });
    }

    // Send file for download
    res.download(file.filePath, file.fileName, (error) => {
      if (error) {
        console.error("Download error:", error);
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to download file.",
      error: error.message,
    });
  }
});
// Delete a file
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid file ID.",
      });
    }

    // Find file
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({
        message: "File not found.",
      });
    }

    // Only Admin or the uploader can delete the file
    const isAdmin = req.user.role === "Admin";
    const isUploader = file.uploadedBy.toString() === req.user.id;

    if (!isAdmin && !isUploader) {
      return res.status(403).json({
        message: "Access denied. This file can only be deleted by the Admin or the user who uploaded it.",
      });
    }

    // Delete physical file from uploads folder
    try {
      await fs.promises.unlink(file.filePath);
    } catch (error) {
      // Continue if physical file is already missing
      if (error.code !== "ENOENT") {
        throw error;
      }
    }

    // Delete file information from MongoDB
    await File.findByIdAndDelete(id);

    res.status(200).json({
      message: "File deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete file.",
      error: error.message,
    });
  }
});
module.exports = router;