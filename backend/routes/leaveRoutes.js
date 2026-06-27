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

router.post("/apply", (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  console.log("Leave data received:", req.body);

  if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Step 1: Check for overlapping leaves (Pending or Approved)
  const overlapSql = `
    SELECT id FROM leave_requests
    WHERE employee_id = ?
      AND status IN ('Pending', 'Approved')
      AND ? <= end_date
      AND ? >= start_date
    LIMIT 1
  `;

  db.query(overlapSql, [employee_id, start_date, end_date], (overlapErr, overlapResult) => {
    if (overlapErr) {
      console.error("Overlap check error:", overlapErr);
      return res.status(500).json({ success: false, message: "Server error during overlap check." });
    }

    if (overlapResult.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a leave request for these dates.",
      });
    }

    // Step 2: Calculate used (Approved) leave days to check balance
    const balanceSql = `
      SELECT start_date, end_date FROM leave_requests
      WHERE employee_id = ?
        AND status = 'Approved'
    `;

    db.query(balanceSql, [employee_id], (balErr, approvedLeaves) => {
      if (balErr) {
        console.error("Balance check error:", balErr);
        return res.status(500).json({ success: false, message: "Server error during balance check." });
      }

      const usedDays = approvedLeaves.reduce((total, leave) => {
        return total + daysBetween(leave.start_date, leave.end_date);
      }, 0);

      const remaining = TOTAL_LEAVE_DAYS - usedDays;
      const requested = daysBetween(start_date, end_date);

      if (requested > remaining) {
        const dayStr = remaining === 1 ? "day" : "days";
        return res.status(400).json({
          success: false,
          message: `You have only ${remaining} ${dayStr} remaining. Please apply leave within your allocated leave limit.`,
        });
      }

      // Step 3: All checks passed — insert leave request
      const sql = `
        INSERT INTO leave_requests 
        (employee_id, leave_type, start_date, end_date, reason, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
      `;

      db.query(sql, [employee_id, leave_type, start_date, end_date, reason], (err, result) => {
        if (err) {
          console.error("Apply leave error:", err);
          return res.status(500).json({ success: false, message: err.message });
        }

        res.json({
          success: true,
          message: "Leave applied successfully",
          leaveId: result.insertId,
        });
      });
    });
  });
});

router.get("/history/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;

  const sql = `
    SELECT
      id,
      leave_type,
      DATE_FORMAT(start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(end_date, '%d-%m-%Y') AS end_date,
      DATEDIFF(end_date, start_date) + 1 AS leave_days,
      reason,
      status
    FROM leave_requests
    WHERE employee_id = ?
    ORDER BY applied_at DESC
  `;

  db.query(sql, [employeeId], (err, result) => {
    if (err) {
      console.error("Fetch leave history error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    res.json({ success: true, leaves: result });
  });
});

// Cancel leave request
router.put("/cancel/:id", (req, res) => {
  const leaveId = req.params.id;

  const sql = `
    UPDATE leave_requests 
    SET status = 'Cancelled' 
    WHERE id = ? AND status = 'Pending'
  `;

  db.query(sql, [leaveId], (err, result) => {
    if (err) {
      console.error("Cancel leave error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: "Leave request cannot be cancelled because it is not pending or does not exist.",
      });
    }

    res.json({ success: true, message: "Leave cancelled successfully" });
  });
});

// Get leave summary statistics for an employee
router.get("/summary/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;

  const sql = `
    SELECT status, DATEDIFF(end_date, start_date) + 1 AS leave_days FROM leave_requests
    WHERE employee_id = ?
  `;

  db.query(sql, [employeeId], (err, results) => {
    if (err) {
      console.error("Fetch leave summary error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    let leavesTaken = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let rejectedRequests = 0;
    let cancelledRequests = 0;

    results.forEach((leave) => {
      const status = leave.status.toLowerCase();
      const leave_days = leave.leave_days || 0;
      if (status === "pending") {
        pendingRequests++;
      } else if (status === "approved") {
        approvedRequests++;
        leavesTaken += leave_days;
      } else if (status === "rejected") {
        rejectedRequests++;
      } else if (status === "cancelled") {
        cancelledRequests++;
      }
    });

    const remaining = TOTAL_LEAVE_DAYS - leavesTaken;

    res.json({
      success: true,
      summary: {
        totalAllowed: TOTAL_LEAVE_DAYS,
        leavesTaken,
        remaining,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        cancelledRequests,
      },
    });
  });
});

module.exports = router;
