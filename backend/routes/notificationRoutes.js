const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotificationAPI,
  markAsRead,
  markAllAsRead,
  toggleNotifications,
  getSettings
} = require("../controllers/notificationController");

// Specific routes FIRST — must come before the dynamic /:userId catch-all
router.get("/unread-count/:userId", getUnreadCount);
router.get("/settings/:userId", getSettings);
router.put("/read-all/:userId", markAllAsRead);
router.put("/toggle/:userId", toggleNotifications);
router.put("/read/:id", markAsRead);
router.post("/", createNotificationAPI);
// Generic dynamic route LAST
router.get("/:userId", getNotifications);

module.exports = router;
