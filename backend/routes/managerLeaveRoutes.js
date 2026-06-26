const express = require("express");
const db = require("../config/db");

const router = express.Router();

// Get all leave requests
router.get("/leaves", (req, res) => {
  const sql = `
    SELECT 
      lr.id,
      lr.employee_id,
      u.name AS employee_name,
      lr.leave_type,
      DATE_FORMAT(lr.start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(lr.end_date, '%d-%m-%Y') AS end_date,
      lr.reason,
      lr.status
    FROM leave_requests lr
    LEFT JOIN users u ON lr.employee_id = u.id
    ORDER BY lr.applied_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Manager leaves fetch error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      leaves: results,
    });
  });
});

// Approve leave
router.put("/approve/:id", (req, res) => {
  const leaveId = req.params.id;

  const sql = `
    UPDATE leave_requests
    SET status = 'Approved'
    WHERE id = ?
  `;

  db.query(sql, [leaveId], (err) => {
    if (err) {
      console.error("Approve leave error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Leave approved successfully",
    });
  });
});

// Reject leave
router.put("/reject/:id", (req, res) => {
  const leaveId = req.params.id;

  const sql = `
    UPDATE leave_requests
    SET status = 'Rejected'
    WHERE id = ?
  `;

  db.query(sql, [leaveId], (err) => {
    if (err) {
      console.error("Reject leave error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      message: "Leave rejected successfully",
    });
  });
});

module.exports = router;