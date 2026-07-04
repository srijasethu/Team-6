const express = require("express");
const db = require("../config/db");
const { recalculateForEmployee, MONTHLY_PAID_LIMIT, ANNUAL_PAID_ALLOCATION } = require("../utils/recalculate");
const { createNotification } = require("../controllers/notificationController");

const router = express.Router();

// Benefit leave types: get a fixed quota of paid days, then fall back to monthly balance
const BENEFIT_TYPES = { "Maternity Leave": 182, "Paternity Leave": 15 };

// ─── Shared helpers (kept for computePaidUnpaid during insert preview) ─────────
function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function buildMonthlyCounters(existingLeaves, holidayDates) {
  const counters = {};
  const sorted = [...existingLeaves].sort(
    (a, b) => new Date(a.start_date) - new Date(b.start_date) || a.id - b.id
  );
  sorted.forEach((leave) => {
    const maxBenefitDays = BENEFIT_TYPES[leave.leave_type] || 0;
    const isBenefitType = maxBenefitDays > 0;
    let benefitCounter = 0;

    let curr = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, "0");
      const dd = String(curr.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const isSunday = curr.getDay() === 0;
      const isHoliday = holidayDates && holidayDates.has(dateStr);

      if (!isSunday && !isHoliday) {
        const mk = toMonthKey(curr);
        if (!counters[mk]) counters[mk] = 0;

        if (isBenefitType) {
          benefitCounter++;
          if (benefitCounter > maxBenefitDays) {
            // Overflow days from benefit type consume monthly balance
            if (counters[mk] < MONTHLY_PAID_LIMIT) counters[mk]++;
          }
          // Days within benefit quota do NOT consume monthly balance
        } else {
          if (counters[mk] < MONTHLY_PAID_LIMIT) counters[mk]++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  });
  return counters;
}

function computePaidUnpaid(startDate, endDate, counters, leaveType, holidayDates) {
  let paid = 0;
  let unpaid = 0;
  let total_calendar = 0;
  let excluded = 0;
  let actual_leave = 0;
  let benefitCounter = 0;
  let benefitDaysUsed = 0;
  let monthlyPaidDaysUsed = 0;

  const maxBenefitDays = BENEFIT_TYPES[leaveType] || 0;
  const isBenefitType = maxBenefitDays > 0;

  let curr = new Date(startDate);
  const end = new Date(endDate);

  while (curr <= end) {
    total_calendar++;
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, "0");
    const dd = String(curr.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const isSunday = curr.getDay() === 0;
    const isHoliday = holidayDates && holidayDates.has(dateStr);

    if (isSunday || isHoliday) {
      excluded++;
    } else {
      actual_leave++;
      const mk = toMonthKey(curr);
      if (!counters[mk]) counters[mk] = 0;

      if (isBenefitType) {
        benefitCounter++;
        if (benefitCounter <= maxBenefitDays) {
          // Within benefit quota — fully paid
          paid++;
          benefitDaysUsed++;
        } else {
          // Benefit exhausted — try monthly paid balance
          if (counters[mk] < MONTHLY_PAID_LIMIT) {
            paid++;
            monthlyPaidDaysUsed++;
            counters[mk]++;
          } else {
            unpaid++;
          }
        }
      } else {
        // Personal/Medical: counted against monthly paid leave limit
        if (counters[mk] < MONTHLY_PAID_LIMIT) {
          paid++;
          counters[mk]++;
        } else {
          unpaid++;
        }
      }
    }
    curr.setDate(curr.getDate() + 1);
  }

  return { paid, unpaid, total: total_calendar, excluded, actual_leave, benefitDaysUsed, monthlyPaidDaysUsed };
}

function resolvePaymentMeta(paid, unpaid, leaveType, benefitDaysUsed, monthlyPaidDaysUsed) {
  if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
    const typeName = leaveType === "Maternity Leave" ? "Maternity" : "Paternity";
    const parts = [];
    if (benefitDaysUsed > 0) parts.push(`${benefitDaysUsed} ${typeName}`);
    if (monthlyPaidDaysUsed > 0) parts.push(`${monthlyPaidDaysUsed} Monthly`);
    if (unpaid > 0) parts.push(`${unpaid} Unpaid`);
    const breakdownStr = parts.join(" + ");
    if (unpaid === 0) {
      return { payment_type: "Paid", alert_message: breakdownStr || null };
    }
    return { payment_type: "Partly Paid", alert_message: breakdownStr };
  }

  if (paid === 0 && unpaid === 0) return { payment_type: "Paid", alert_message: null };
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

  // Step 0: Eligibility check (gender + annual check)
  const userSql = "SELECT name, gender FROM users WHERE id = ?";
  db.query(userSql, [employee_id], (genderErr, userResult) => {
    if (genderErr) return res.status(500).json({ success: false, message: "Server error checking eligibility." });
    if (userResult.length === 0) return res.status(404).json({ success: false, message: "Employee not found." });

    const gender = userResult[0].gender;
    const name = userResult[0].name;

    if (leave_type === "Maternity Leave" && gender === "Male") {
      return res.status(400).json({ success: false, message: "Maternity Leave is only eligible for Female employees." });
    }
    if (leave_type === "Paternity Leave" && gender === "Female") {
      return res.status(400).json({ success: false, message: "Paternity Leave is only eligible for Male employees." });
    }

    if (leave_type === "Maternity Leave" || leave_type === "Paternity Leave") {
      const year = new Date(start_date).getFullYear();
      const annualCheckSql = `
        SELECT id FROM leave_requests
        WHERE employee_id = ?
          AND leave_type = ?
          AND status IN ('Pending', 'Approved')
          AND (YEAR(start_date) = ? OR YEAR(end_date) = ?)
        LIMIT 1
      `;
      db.query(annualCheckSql, [employee_id, leave_type, year, year], (annualCheckErr, annualCheckResult) => {
        if (annualCheckErr) return res.status(500).json({ success: false, message: "Server error during annual validation." });
        if (annualCheckResult.length > 0) {
          const benefitName = leave_type === "Maternity Leave" ? "Maternity" : "Paternity";
          return res.status(400).json({
            success: false,
            message: `You have already applied for ${benefitName} Leave in this calendar year. This benefit can only be availed once per year.`
          });
        }
        proceedWithOverlapCheck();
      });
    } else {
      proceedWithOverlapCheck();
    }

    function proceedWithOverlapCheck() {
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
          SELECT id, start_date, end_date, leave_type FROM leave_requests
          WHERE employee_id = ? AND status IN ('Approved', 'Pending')
          ORDER BY start_date ASC, id ASC
        `;
        db.query(existingSql, [employee_id], (balErr, existingLeaves) => {
          if (balErr) return res.status(500).json({ success: false, message: "Server error fetching existing leaves." });

          // Fetch holidays from database
          const holidaysSql = "SELECT DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date FROM company_holidays";
          db.query(holidaysSql, (holidaysErr, holidayRows) => {
            if (holidaysErr) return res.status(500).json({ success: false, message: "Server error fetching holidays." });

            const holidayDates = new Set();
            if (holidayRows) {
              holidayRows.forEach(row => {
                holidayDates.add(row.holiday_date);
              });
            }

            // Step 3: compute preview paid/unpaid for the new request
            const counters = buildMonthlyCounters(existingLeaves, holidayDates);
            const { paid, unpaid, total, excluded, actual_leave, benefitDaysUsed, monthlyPaidDaysUsed } = computePaidUnpaid(start_date, end_date, counters, leave_type, holidayDates);

            const { payment_type, alert_message } = resolvePaymentMeta(paid, unpaid, leave_type, benefitDaysUsed, monthlyPaidDaysUsed);

            // Step 4: insert
            const insertSql = `
              INSERT INTO leave_requests
              (employee_id, leave_type, start_date, end_date, reason, status,
               total_days, excluded_days, actual_leave_days, paid_days, unpaid_days, payment_type, alert_message)
              VALUES (?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(
              insertSql,
              [employee_id, leave_type, start_date, end_date, reason, total, excluded, actual_leave, paid, unpaid, payment_type, alert_message],
              (insertErr, result) => {
                if (insertErr) {
                  console.error("Apply leave error:", insertErr);
                  return res.status(500).json({ success: false, message: insertErr.message });
                }

                // Send submit notifications
                createNotification(employee_id, "Leave Submitted", "Your leave request has been submitted successfully.", "info", "leave_request");

                db.query("SELECT id FROM users WHERE role = 'manager'", (mErr, managers) => {
                  if (!mErr && managers) {
                    managers.forEach(mgr => {
                      createNotification(mgr.id, "New Leave Request", `"${name}" submitted a leave request.`, "info", "leave_request");
                    });
                  }
                });

                recalculateForEmployee(employee_id, db, (recalcErr) => {
                  if (recalcErr) console.error("Recalculate after apply error:", recalcErr);

                  // Check for low leave balance
                  const queryYear = new Date(start_date).getFullYear();
                  db.query(
                    "SELECT SUM(paid_days) AS paid_taken FROM leave_requests WHERE employee_id = ? AND status = 'Approved' AND YEAR(start_date) = ?",
                    [employee_id, queryYear],
                    (sumErr, sumResult) => {
                      if (!sumErr && sumResult.length > 0) {
                        const paidTaken = sumResult[0].paid_taken || 0;
                        const remaining = Math.max(0, 36 - paidTaken);
                        if (remaining <= 5) {
                          createNotification(employee_id, "Low Leave Balance", "You have limited paid leave remaining.", "warning", "balance");
                        }
                      }
                    }
                  );

                  res.json({
                    success: true,
                    message: "Leave applied successfully",
                    leaveId: result.insertId,
                    total_days: total,
                    excluded_days: excluded,
                    actual_leave_days: actual_leave,
                    paid_days: paid,
                    unpaid_days: unpaid,
                    payment_type,
                    alert_message,
                  });
                });
              }
            );
          });   // close holidaysSql db.query
        });     // close existingSql db.query
      });       // close overlapSql db.query
    }
  });

});         // close router.post("/apply")

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
      excluded_days,
      actual_leave_days,
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

        // Notify employee of cancellation
        createNotification(employeeId, "Leave Cancelled", "Your leave request has been cancelled.", "warning", "leave_request");

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
    SELECT id, status, start_date, end_date, leave_type,
           total_days, paid_days, unpaid_days, payment_type
    FROM leave_requests
    WHERE employee_id = ?
  `;
  db.query(sql, [employeeId], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

    const currentYear = new Date().getFullYear();
    let totalPaidTakenThisYear = 0;
    let totalUnpaidTakenThisYear = 0;
    let annualPaidTakenThisYear = 0;
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

          let annualContributed = leave.paid_days || 0;
          if (leave.leave_type === "Paternity Leave") {
            annualContributed = Math.max(0, annualContributed - 15);
          } else if (leave.leave_type === "Maternity Leave") {
            annualContributed = Math.max(0, annualContributed - 182);
          }
          annualPaidTakenThisYear += annualContributed;
        }
      }
      else if (status === "rejected")  rejected++;
      else if (status === "cancelled") cancelled++;
    });

    const totalAllowed = ANNUAL_PAID_ALLOCATION;
    const remaining   = Math.max(0, totalAllowed - annualPaidTakenThisYear);

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
