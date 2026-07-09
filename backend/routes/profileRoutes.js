const express = require("express");
const multer = require("multer");
const db = require("../config/db");

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
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!result || result.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user: result[0] });
  });
});

// ── Upload uses memory storage: convert to base64 data URI saved in MySQL ─────
// This avoids Railway's ephemeral filesystem — photos survive restarts/redeploys
const upload = multer({ storage: multer.memoryStorage() });

// ── PUT /upload-photo/:id ─────────────────────────────────────────────────────
router.put("/upload-photo/:id", upload.single("profile_photo"), (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  // Convert buffer to base64 data URI stored directly in MySQL
  const mimeType = req.file.mimetype || "image/jpeg";
  const base64 = req.file.buffer.toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  const sql = "UPDATE users SET profile_photo = ? WHERE id = ?";

  db.query(sql, [dataUri, userId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      profile_photo: dataUri,
    });
  });
});

// ── DELETE /remove-photo/:id ──────────────────────────────────────────────────
router.delete("/remove-photo/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "UPDATE users SET profile_photo = NULL WHERE id = ?";

  db.query(sql, [userId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({
      success: true,
      profile_photo: null,
    });
  });
});

// ── PUT /update/:id ───────────────────────────────────────────────────────────
router.put("/update/:id", (req, res) => {
  const userId = req.params.id;

  const { name, email, phone, department, joining_date, designation } =
    req.body;

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
