const express = require("express");
const multer = require("multer");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ── Test Route ────────────────────────────────────────────────────────────────
router.get("/test", (req, res) => {
  res.json({ message: "Profile routes working" });
});

// ── GET /get/:id ──────────────────────────────────────────────────────────────
router.get("/get/:id", (req, res) => {
  const userId = req.params.id;
  const sql = `
    SELECT
      id, name, email, role, employee_id,
      department, phone,
      DATE_FORMAT(joining_date, '%Y-%m-%d') AS joining_date,
      designation, profile_photo, gender
    FROM users
    WHERE id = ?
  `;
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user profile:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (!result || result.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: result[0] });
  });
});

// Ensure uploads directory exists and is writable
const uploadsDir = path.join(__dirname, "..", "uploads");
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created uploads directory at:", uploadsDir);
  }
} catch (err) {
  console.error("Error verifying/creating uploads directory:", err);
}

// Multer disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    } catch (err) {
      console.error("Multer destination error:", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const deleteOldFile = (photoPath) => {
  if (!photoPath) return;
  // If it's a relative path starting with /uploads/, delete the file
  if (photoPath.startsWith("/uploads/")) {
    const filename = photoPath.replace("/uploads/", "");
    const filePath = path.join(uploadsDir, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Deleted old profile photo file:", filePath);
      }
    } catch (err) {
      console.error("Failed to delete old profile photo file:", err);
    }
  }
};

// ── PUT /upload-photo/:id ─────────────────────────────────────────────────────
router.put("/upload-photo/:id", upload.single("profile_photo"), (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    console.error("Upload error: No file found in request");
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Save relative path in database (e.g. /uploads/filename.jpg)
  const relativePath = `/uploads/${req.file.filename}`;

  // Fetch the old profile photo path first to delete the file
  const selectSql = "SELECT profile_photo FROM users WHERE id = ?";
  db.query(selectSql, [userId], (selectErr, result) => {
    if (selectErr) {
      console.error("Error fetching old profile photo for removal:", selectErr);
    } else if (result && result.length > 0) {
      deleteOldFile(result[0].profile_photo);
    }

    // Update with new path
    const sql = "UPDATE users SET profile_photo = ? WHERE id = ?";
    db.query(sql, [relativePath, userId], (err) => {
      if (err) {
        console.error("Database error updating profile photo:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      console.log(`Successfully updated profile photo for user ${userId} to ${relativePath}`);
      res.json({
        success: true,
        profile_photo: relativePath,
      });
    });
  });
});

// ── DELETE /remove-photo/:id ──────────────────────────────────────────────────
router.delete("/remove-photo/:id", (req, res) => {
  const userId = req.params.id;

  const selectSql = "SELECT profile_photo FROM users WHERE id = ?";
  db.query(selectSql, [userId], (selectErr, result) => {
    if (selectErr) {
      console.error("Error fetching old profile photo for removal:", selectErr);
    } else if (result && result.length > 0) {
      deleteOldFile(result[0].profile_photo);
    }

    const sql = "UPDATE users SET profile_photo = NULL WHERE id = ?";
    db.query(sql, [userId], (err) => {
      if (err) {
        console.error("Database error removing profile photo:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      console.log(`Successfully removed profile photo for user ${userId}`);
      res.json({
        success: true,
        profile_photo: null,
      });
    });
  });
});

// ── PUT /update/:id ───────────────────────────────────────────────────────────
router.put("/update/:id", (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, department, joining_date, designation } = req.body;

  const formattedJoiningDate = joining_date
    ? joining_date.substring(0, 10)
    : null;

  const sql = `
    UPDATE users
    SET name = ?, email = ?, phone = ?, department = ?, joining_date = ?, designation = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [name, email, phone, department, formattedJoiningDate, designation, userId],
    (err) => {
      if (err) {
        console.error("Database error updating user details:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      const selectSql = `
        SELECT
          id, name, email, role, employee_id,
          department, phone,
          DATE_FORMAT(joining_date, '%Y-%m-%d') AS joining_date,
          designation, profile_photo, gender
        FROM users
        WHERE id = ?
      `;

      db.query(selectSql, [userId], (selectErr, result) => {
        if (selectErr) {
          console.error("Database error refetching user details:", selectErr);
          return res.status(500).json({ success: false, error: selectErr.message });
        }

        res.json({
          success: true,
          user: result[0],
        });
      });
    },
  );
});

module.exports = router;
