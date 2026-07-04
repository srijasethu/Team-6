const db = require("../config/db");

// Internal helper to create a notification in DB directly
const createNotificationInternal = (userId, title, message, type = "info", category = null, callback = () => {}) => {
  const sql = `
    INSERT INTO notifications (user_id, title, message, type, category)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [userId, title, message, type, category], (err, result) => {
    if (err) {
      console.error("Error inserting notification internally:", err);
      return callback(err);
    }
    callback(null, result);
  });
};

// GET /api/notifications/:userId
const getNotifications = (req, res) => {
  const userId = req.params.userId;
  const sql = `
    SELECT id, title, message, type, category, is_read, created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, notifications: results });
  });
};

// GET /api/notifications/unread-count/:userId
const getUnreadCount = (req, res) => {
  const userId = req.params.userId;
  // First check if user has notifications enabled
  const checkSql = "SELECT notifications_enabled FROM users WHERE id = ?";
  db.query(checkSql, [userId], (err, results) => {
    if (err) {
      console.error("Error checking user notification settings:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const isEnabled = results[0].notifications_enabled;
    if (!isEnabled) {
      return res.json({ success: true, count: 0 });
    }

    const countSql = "SELECT COUNT(*) AS unreadCount FROM notifications WHERE user_id = ? AND is_read = FALSE";
    db.query(countSql, [userId], (countErr, countResults) => {
      if (countErr) {
        console.error("Error counting unread notifications:", countErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, count: countResults[0].unreadCount });
    });
  });
};

// POST /api/notifications
const createNotification = (req, res) => {
  const { userId, title, message, type, category } = req.body;
  if (!userId || !title || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  createNotificationInternal(userId, title, message, type, category, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Failed to create notification" });
    }
    res.status(201).json({ success: true, message: "Notification created successfully", notificationId: result.insertId });
  });
};

// PUT /api/notifications/read/:id
const markAsRead = (req, res) => {
  const notificationId = req.params.id;
  const sql = "UPDATE notifications SET is_read = TRUE WHERE id = ?";
  db.query(sql, [notificationId], (err, result) => {
    if (err) {
      console.error("Error marking notification as read:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Notification marked as read" });
  });
};

// PUT /api/notifications/read-all/:userId
const markAllAsRead = (req, res) => {
  const userId = req.params.userId;
  const sql = "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE";
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error marking all notifications as read:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "All notifications marked as read" });
  });
};

// PUT /api/notifications/toggle/:userId
const toggleNotifications = (req, res) => {
  const userId = req.params.userId;
  // Get current state to toggle it
  const selectSql = "SELECT notifications_enabled FROM users WHERE id = ?";
  db.query(selectSql, [userId], (selectErr, selectResult) => {
    if (selectErr) {
      console.error("Error fetching settings for toggle:", selectErr);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (selectResult.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const nextState = selectResult[0].notifications_enabled ? 0 : 1;
    const updateSql = "UPDATE users SET notifications_enabled = ? WHERE id = ?";
    db.query(updateSql, [nextState, userId], (updateErr) => {
      if (updateErr) {
        console.error("Error toggling settings:", updateErr);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      res.json({ success: true, notifications_enabled: nextState === 1 });
    });
  });
};

// GET /api/notifications/settings/:userId
const getSettings = (req, res) => {
  const userId = req.params.userId;
  const sql = "SELECT notifications_enabled FROM users WHERE id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error checking notification settings:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, notifications_enabled: results[0].notifications_enabled === 1 });
  });
};

module.exports = {
  createNotificationInternal,
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  toggleNotifications,
  getSettings,
};
