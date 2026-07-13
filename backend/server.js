const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes.js");
const leaveRoutes = require("./routes/leaveRoutes");
const managerLeaveRoutes = require("./routes/managerLeaveRoutes");
const holidayRoutes = require("./routes/holidayRoutes");

const app = express();

app.use(
  cors({
    origin: ["https://team-6-omega.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.json());

// Ensure uploads directory exists at startup (Railway ephemeral FS never has it)
const fs = require("fs");
const path = require("path");
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("Created uploads directory at:", uploadsPath);
}

// Serve uploaded images
app.use("/uploads", express.static(uploadsPath));

// Direct test route
app.get("/api/profile/test", (req, res) => {
  res.json({ message: "Direct test working" });
});

const notificationRoutes = require("./routes/notificationRoutes");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/manager", managerLeaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/notifications", notificationRoutes);
require("./config/db");

app.get("/", (req, res) => {
  res.send("Leave Management Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
