const express = require("express");
const multer = require("multer");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({ message: "Profile routes working" });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const deleteFileFromUrl = (photoUrl) => {
  if (!photoUrl) return;

  try {
    const prefix = "http://localhost:5000/uploads/";

    if (photoUrl.startsWith(prefix)) {
      const filename = photoUrl.replace(prefix, "");
      const filePath = path.join(__dirname, "..", "uploads", filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error("Failed to delete old avatar file:", err);
  }
};

router.put("/upload-photo/:id", upload.single("profile_photo"), (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imagePath = `http://localhost:5000/uploads/${req.file.filename}`;

  const selectSql = "SELECT profile_photo FROM users WHERE id = ?";

  db.query(selectSql, [userId], (selectErr, result) => {
    if (!selectErr && result.length > 0) {
      deleteFileFromUrl(result[0].profile_photo);
    }

    const sql = "UPDATE users SET profile_photo = ? WHERE id = ?";

    db.query(sql, [imagePath, userId], (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        profile_photo: imagePath,
      });
    });
  });
});

router.delete("/remove-photo/:id", (req, res) => {
  const userId = req.params.id;

  const selectSql = "SELECT profile_photo FROM users WHERE id = ?";

  db.query(selectSql, [userId], (selectErr, result) => {
    if (!selectErr && result.length > 0) {
      deleteFileFromUrl(result[0].profile_photo);
    }

    const sql = "UPDATE users SET profile_photo = NULL WHERE id = ?";

    db.query(sql, [userId], (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        success: true,
        profile_photo: null,
      });
    });
  });
});

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
        return res.status(500).json(err);
      }

      const selectSql = `
        SELECT 
          id,
          name,
          email,
          role,
          employee_id,
          department,
          phone,
          DATE_FORMAT(joining_date, '%Y-%m-%d') AS joining_date,
          designation,
          profile_photo
        FROM users
        WHERE id = ?
      `;

      db.query(selectSql, [userId], (selectErr, result) => {
        if (selectErr) {
          return res.status(500).json(selectErr);
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
