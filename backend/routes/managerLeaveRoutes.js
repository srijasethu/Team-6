const express = require("express");
const db = require("../config/db");

const router = express.Router();

const TOTAL_LEAVE_DAYS = 36; // Annual leave allowance

// Helper: calculate inclusive day count between two date values (Date objects or YYYY-MM-DD strings)
function daysBetween(startVal, endVal) {
  const toDateStr = (v) =>
    v instanceof Date ? v.toISOString().substring(0, 10) : String(v).substring(0, 10);
  const start = new Date(toDateStr(startVal));
  const end = new Date(toDateStr(endVal));
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

// Get all leave requests
router.get("/leaves", (req, res) => {
  const sql = `
    SELECT 
      lr.id,
      u.name AS employee_name,
      u.employee_id AS employee_code,
      lr.leave_type,
      DATE_FORMAT(lr.start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(lr.end_date, '%d-%m-%Y') AS end_date,
      DATEDIFF(lr.end_date, lr.start_date) + 1 AS leave_days,
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

// Approve leave — checks balance before approving
router.put("/approve/:id", (req, res) => {
  const leaveId = req.params.id;

  // Step 1: Fetch the leave request being approved
  const fetchSql = `
    SELECT employee_id, DATEDIFF(end_date, start_date) + 1 AS leave_days, status
    FROM leave_requests
    WHERE id = ?
  `;

  db.query(fetchSql, [leaveId], (fetchErr, fetchResult) => {
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
    const requestedDays = leave.leave_days || 0;

    // Step 2: Calculate already approved leave days for this employee
    const balanceSql = `
      SELECT DATEDIFF(end_date, start_date) + 1 AS leave_days FROM leave_requests
      WHERE employee_id = ?
        AND status = 'Approved'
        AND id != ?
    `;

    db.query(balanceSql, [employeeId, leaveId], (balErr, approvedLeaves) => {
      if (balErr) {
        console.error("Balance check error:", balErr);
        return res.status(500).json({ success: false, message: "Server error during balance check." });
      }

      const usedDays = approvedLeaves.reduce((total, l) => {
        return total + (l.leave_days || 0);
      }, 0);

      const remaining = TOTAL_LEAVE_DAYS - usedDays;

      if (requestedDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Cannot approve. Employee has insufficient leave balance (${remaining} day(s) remaining, ${requestedDays} day(s) requested).`,
        });
      }

      // Step 3: All checks passed — approve
      const approveSql = `
        UPDATE leave_requests
        SET status = 'Approved'
        WHERE id = ? AND status = 'Pending'
      `;

      db.query(approveSql, [leaveId], (err, result) => {
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

        res.json({ success: true, message: "Leave approved successfully" });
      });
    });
  });
});

// Reject leave
router.put("/reject/:id", (req, res) => {
  const leaveId = req.params.id;

  const sql = `
    UPDATE leave_requests
    SET status = 'Rejected'
    WHERE id = ? AND status = 'Pending'
  `;

  db.query(sql, [leaveId], (err, result) => {
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

    res.json({ success: true, message: "Leave rejected successfully" });
  });
});

module.exports = router;