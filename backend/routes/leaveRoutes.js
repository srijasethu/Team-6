const express = require("express");
const db = require("../config/db");
const { recalculateForEmployee, MONTHLY_PAID_LIMIT, ANNUAL_PAID_ALLOCATION } = require("../utils/recalculate");

const router = express.Router();

// ─── Shared helpers (kept for computePaidUnpaid during insert preview) ─────────
function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function buildMonthlyCounters(existingLeaves) {
  const counters = {};
  const sorted = [...existingLeaves].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date) || a.id - b.id
  );
  sorted.forEach((leave) => {
    let curr = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    while (curr <= end) {
      const mk = toMonthKey(curr);
      if (!counters[mk]) counters[mk] = 0;
      if (counters[mk] < MONTHLY_PAID_LIMIT) counters[mk]++;
      curr.setDate(curr.getDate() + 1);
    }
  });
  return counters;
}

function computePaidUnpaid(startDate, endDate, counters) {
  let paid = 0, unpaid = 0, total = 0;
  let curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    const mk = toMonthKey(curr);
    if (!counters[mk]) counters[mk] = 0;
    if (counters[mk] < MONTHLY_PAID_LIMIT) { paid++; counters[mk]++; } else { unpaid++; }
    total++;
    curr.setDate(curr.getDate() + 1);
  }
  return { paid, unpaid, total };
}

function resolvePaymentMeta(paid, unpaid) {
  if (paid > 0 && unpaid === 0) return { payment_type: "Paid", alert_message: null };
  if (paid > 0 && unpaid > 0) return {
    payment_type: "Partly Paid",
    alert_message: "This leave is partly unpaid because your monthly paid leave limit is exceeded.",
  };
  return {
    payment_type: "Unpaid",
    alert_message: "This leave is unpaid because your monthly paid leave limit has already been used.",
  };
}

// ─── POST /apply ───────────────────────────────────────────────────────────────
router.post("/apply", (req, res) => {
  const { employee_id, leave_type, start_date, end_date, reason } = req.body;

  if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  // Step 1: overlap check
  const overlapSql = `
    SELECT id FROM leave_requests
    WHERE employee_id = ?
      AND status IN ('Pending', 'Approved')
      AND ? <= end_date
      AND ? >= start_date
    LIMIT 1
  `;
  db.query(overlapSql, [employee_id, start_date, end_date], (overlapErr, overlapResult) => {
    if (overlapErr) return res.status(500).json({ success: false, message: "Server error during overlap check." });
    if (overlapResult.length > 0) {
      return res.status(400).json({ success: false, message: "You already have a leave request for these dates." });
    }

    // Step 2: fetch existing Approved/Pending leaves for this employee
    const existingSql = `
      SELECT id, start_date, end_date FROM leave_requests
      WHERE employee_id = ? AND status IN ('Approved', 'Pending')
      ORDER BY start_date ASC, id ASC
    `;
    db.query(existingSql, [employee_id], (balErr, existingLeaves) => {
      if (balErr) return res.status(500).json({ success: false, message: "Server error fetching existing leaves." });

      // Step 3: compute preview paid/unpaid for the new request
      const counters = buildMonthlyCounters(existingLeaves);
      const { paid, unpaid, total } = computePaidUnpaid(start_date, end_date, counters);
      const { payment_type, alert_message } = resolvePaymentMeta(paid, unpaid);

      // Step 4: insert
      const insertSql = `
        INSERT INTO leave_requests
        (employee_id, leave_type, start_date, end_date, reason, status,
         total_days, paid_days, unpaid_days, payment_type, alert_message)
        VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?)
      `;
      db.query(
        insertSql,
        [employee_id, leave_type, start_date, end_date, reason, total, paid, unpaid, payment_type, alert_message],
        (insertErr, result) => {
          if (insertErr) {
            console.error("Apply leave error:", insertErr);
            return res.status(500).json({ success: false, message: insertErr.message });
          }

          // Step 5: recalculate ALL leaves for this employee to ensure consistency
          recalculateForEmployee(employee_id, db, (recalcErr) => {
            if (recalcErr) console.error("Recalculate after apply error:", recalcErr);

            res.json({
              success: true,
              message: "Leave applied successfully",
              leaveId: result.insertId,
              total_days: total,
              paid_days: paid,
              unpaid_days: unpaid,
              payment_type,
              alert_message,
            });
          });
        }
      );
    });
  });
});

// ─── GET /history/:employeeId ──────────────────────────────────────────────────
router.get("/history/:employeeId", (req, res) => {
  const { employeeId } = req.params;

  const sql = `
    SELECT
      id,
      leave_type,
      DATE_FORMAT(start_date, '%d-%m-%Y') AS start_date,
      DATE_FORMAT(end_date,   '%d-%m-%Y') AS end_date,
      DATEDIFF(end_date, start_date) + 1  AS leave_days,
      total_days,
      paid_days,
      unpaid_days,
      payment_type,
      alert_message,
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

// ─── PUT /cancel/:id ───────────────────────────────────────────────────────────
router.put("/cancel/:id", (req, res) => {
  const { id } = req.params;

  // First get the employee_id so we can recalculate after cancelling
  db.query("SELECT employee_id FROM leave_requests WHERE id = ?", [id], (fetchErr, fetchResult) => {
    if (fetchErr) return res.status(500).json({ success: false, error: fetchErr.message });
    if (!fetchResult || fetchResult.length === 0) {
      return res.status(404).json({ success: false, message: "Leave request not found." });
    }

    const employeeId = fetchResult[0].employee_id;

    db.query(
      "UPDATE leave_requests SET status = 'Cancelled' WHERE id = ? AND status = 'Pending'",
      [id],
      (err, result) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (result.affectedRows === 0) {
          return res.status(400).json({
            success: false,
            message: "Leave request cannot be cancelled because it is not pending or does not exist.",
          });
        }

        // Recalculate all remaining leaves for this employee — freed paid slots may upgrade other leaves
        recalculateForEmployee(employeeId, db, (recalcErr) => {
          if (recalcErr) console.error("Recalculate after cancel error:", recalcErr);
          res.json({ success: true, message: "Leave cancelled successfully" });
        });
      }
    );
  });
});

// ─── GET /summary/:employeeId ─────────────────────────────────────────────────
router.get("/summary/:employeeId", (req, res) => {
  const { employeeId } = req.params;

  const sql = `
    SELECT id, status, start_date, end_date,
           total_days, paid_days, unpaid_days, payment_type
    FROM leave_requests
    WHERE employee_id = ?
  `;
  db.query(sql, [employeeId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const currentYear = new Date().getFullYear();
    let totalPaidTakenThisYear = 0;
    let totalUnpaidTakenThisYear = 0;
    let pending = 0, approved = 0, rejected = 0, cancelled = 0;

    results.forEach((leave) => {
      const status = leave.status.toLowerCase();
      const startYear = new Date(leave.start_date).getFullYear();

      if (status === "pending")   pending++;
      else if (status === "approved") {
        approved++;
        if (startYear === currentYear) {
          totalPaidTakenThisYear   += leave.paid_days   || 0;
          totalUnpaidTakenThisYear += leave.unpaid_days || 0;
        }
      }
      else if (status === "rejected")  rejected++;
      else if (status === "cancelled") cancelled++;
    });

    const totalAllowed = ANNUAL_PAID_ALLOCATION;
    const remaining   = Math.max(0, totalAllowed - totalPaidTakenThisYear);

    res.json({
      success: true,
      summary: {
        totalAllowed,
        paidLeaveAllowedPerMonth: MONTHLY_PAID_LIMIT,
        leavesTaken: totalPaidTakenThisYear,
        totalPaidTakenThisYear,
        totalUnpaidTakenThisYear,
        remaining,
        pendingRequests:   pending,
        approvedRequests:  approved,
        rejectedRequests:  rejected,
        cancelledRequests: cancelled,
        totalRequests:     results.length,
      },
      leaves: results,
    });
  });
});

module.exports = router;
