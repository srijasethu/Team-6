const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.post("/apply", (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  console.log("Leave data received:", req.body);

  const sql = `
    INSERT INTO leave_requests 
    (employee_id, leave_type, start_date, end_date, reason, status)
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(
    sql,
    [employee_id, leave_type, start_date, end_date, reason],
    (err, result) => {
      if (err) {
        console.error("Apply leave error:", err);
        return res.status(500).json({
          success: false,
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Leave applied successfully",
        leaveId: result.insertId,
      });
    },
  );
});

router.get("/history/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;

  const sql = `
    SELECT
      id,
      leave_type,
      DATE_FORMAT(start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(end_date, '%d-%m-%Y') AS end_date,
      reason,
      status
    FROM leave_requests
    WHERE employee_id = ?
    ORDER BY applied_at DESC
  `;

  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error("Fetch leave history error:", err);
      return res.status(500).json({
        success: false,
        error: err.message,
      });
    }

    res.json({
      success: true,
      leaves: result,
    });
  });
});

module.exports = router;
