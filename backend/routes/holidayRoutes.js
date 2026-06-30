const express = require("express");
const db = require("../config/db");

const router = express.Router();

// GET /api/holidays
// Returns all holidays ordered by date
router.get("/", (req, res) => {
  const sql = `
    SELECT 
      id, 
      holiday_name, 
      DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date, 
      holiday_type, 
      description, 
      created_at 
    FROM company_holidays 
    ORDER BY holiday_date ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch holidays error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, holidays: results });
  });
});

// POST /api/holidays
// Adds a new holiday
router.post("/", (req, res) => {
  const { holiday_name, holiday_date, holiday_type, description } = req.body;

  if (!holiday_name || !holiday_date || !holiday_type) {
    return res.status(400).json({ success: false, message: "Holiday name, date, and type are required." });
  }

  const sql = `
    INSERT INTO company_holidays (holiday_name, holiday_date, holiday_type, description)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [holiday_name, holiday_date, holiday_type, description || null], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "A holiday already exists on this date." });
      }
      console.error("Add holiday error:", err);
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json({
      success: true,
      message: "Holiday added successfully",
      holidayId: result.insertId
    });
  });
});

// DELETE /api/holidays/:id
// Deletes a holiday (only allows deleting manager-added holidays, i.e., id > 20)
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT id FROM company_holidays WHERE id = ?", [id], (fetchErr, results) => {
    if (fetchErr) {
      console.error("Fetch holiday before delete error:", fetchErr);
      return res.status(500).json({ success: false, message: "Server error checking holiday." });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Holiday not found." });
    }

    const holidayId = results[0].id;
    if (holidayId <= 20) {
      return res.status(400).json({ success: false, message: "Standard holidays cannot be deleted." });
    }

    db.query("DELETE FROM company_holidays WHERE id = ?", [id], (deleteErr) => {
      if (deleteErr) {
        console.error("Delete holiday error:", deleteErr);
        return res.status(500).json({ success: false, message: deleteErr.message });
      }
      res.json({ success: true, message: "Holiday deleted successfully." });
    });
  });
});

module.exports = router;
