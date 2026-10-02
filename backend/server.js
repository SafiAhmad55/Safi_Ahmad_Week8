const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const projectRoutes = require("./routes/projects");
const authRoutes = require("./routes/auth");
const clientRoutes = require("./routes/clients");
const taskRoutes = require("./routes/tasks");
const fileRoutes = require("./routes/files");
const meetingRoutes = require("./routes/meetings");
const reportRoutes = require("./routes/reports");
const invoiceRoutes = require("./routes/invoices");
const app = express();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/invoices", invoiceRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });

app.get("/", (req, res) => {
 res.send("Week 8 Invoice Management API is running");
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
 console.log(`Week 8 server running on port ${PORT}`);
});