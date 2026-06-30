const express = require("express");
const db = require("../config/db");
const { recalculateForEmployee } = require("../utils/recalculate");

const router = express.Router();

// Get all leave requests
router.get("/leaves", (req, res) => {
  const sql = `
    SELECT 
      lr.id,
      lr.employee_id,
      u.name AS employee_name,
      u.employee_id AS employee_code,
      lr.leave_type,
      DATE_FORMAT(lr.start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(lr.end_date, '%d-%m-%Y') AS end_date,
      DATEDIFF(lr.end_date, lr.start_date) + 1 AS leave_days,
      lr.total_days,
      lr.excluded_days,
      lr.actual_leave_days,
      lr.paid_days,
      lr.unpaid_days,
      lr.payment_type,
      lr.alert_message,
      lr.reason,
      lr.status
    FROM leave_requests lr
    JOIN users u ON lr.employee_id = u.id
    ORDER BY lr.applied_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Manager leaves fetch error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, leaves: results });
  });
});

// ─── Approve leave ─────────────────────────────────────────────────────────────
router.put("/approve/:id", (req, res) => {
  const leaveId = req.params.id;

  // Fetch the leave to get employee_id and check current status
  db.query("SELECT employee_id, status FROM leave_requests WHERE id = ?", [leaveId], (fetchErr, fetchResult) => {
    if (fetchErr) {
      console.error("Fetch leave for approve error:", fetchErr);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (!fetchResult || fetchResult.length === 0) {
      return res.status(400).json({ success: false, message: "Leave request not found." });
    }

    const leave = fetchResult[0];
    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Leave request cannot be approved because it is not pending.",
      });
    }

    const employeeId = leave.employee_id;

    db.query(
      "UPDATE leave_requests SET status = 'Approved' WHERE id = ? AND status = 'Pending'",
      [leaveId],
      (err, result) => {
        if (err) {
          console.error("Approve leave error:", err);
          return res.status(500).json({ success: false, error: err.message });
        }
        if (result && result.affectedRows === 0) {
          return res.status(400).json({
            success: false,
            message: "Leave request cannot be approved because it is not pending or does not exist.",
          });
        }

        // Recalculate all Pending+Approved leaves for this employee
        recalculateForEmployee(employeeId, db, (recalcErr) => {
          if (recalcErr) console.error("Recalculate after approve error:", recalcErr);
          res.json({ success: true, message: "Leave approved successfully" });
        });
      }
    );
  });
});

// ─── Reject leave ──────────────────────────────────────────────────────────────
router.put("/reject/:id", (req, res) => {
  const leaveId = req.params.id;

  // Fetch employee_id before rejecting so we can recalculate
  db.query("SELECT employee_id, status FROM leave_requests WHERE id = ?", [leaveId], (fetchErr, fetchResult) => {
    if (fetchErr) {
      console.error("Fetch leave for reject error:", fetchErr);
      return res.status(500).json({ success: false, message: "Server error." });
    }
    if (!fetchResult || fetchResult.length === 0) {
      return res.status(400).json({ success: false, message: "Leave request not found." });
    }

    const employeeId = fetchResult[0].employee_id;

    db.query(
      "UPDATE leave_requests SET status = 'Rejected' WHERE id = ? AND status = 'Pending'",
      [leaveId],
      (err, result) => {
        if (err) {
          console.error("Reject leave error:", err);
          return res.status(500).json({ success: false, error: err.message });
        }
        if (result && result.affectedRows === 0) {
          return res.status(400).json({
            success: false,
            message: "Leave request cannot be rejected because it is not pending or does not exist.",
          });
        }

        // Recalculate — rejected leave no longer counts, so other leaves may upgrade to Paid
        recalculateForEmployee(employeeId, db, (recalcErr) => {
          if (recalcErr) console.error("Recalculate after reject error:", recalcErr);
          res.json({ success: true, message: "Leave rejected successfully" });
        });
      }
    );
  });
});

module.exports = router;