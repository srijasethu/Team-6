const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes.js");
const leaveRoutes = require("./routes/leaveRoutes");
const managerLeaveRoutes = require("./routes/managerLeaveRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Direct test route
app.get("/api/profile/test", (req, res) => {
  res.json({ message: "Direct test working" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/manager", managerLeaveRoutes);
require("./config/db");

app.get("/", (req, res) => {
  res.send("Leave Management Backend Running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
