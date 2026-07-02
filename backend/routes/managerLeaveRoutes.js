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

// ─── Reporting Summary Endpoint ───────────────────────────────────────────────
router.get("/reports/summary", (req, res) => {
  const { startDate, endDate } = req.query;

  // 1. Get total active employees
  const empSql = "SELECT COUNT(*) AS totalEmployees FROM users WHERE role = 'employee'";
  db.query(empSql, (err, empRes) => {
    if (err) {
      console.error("Error fetching total employees:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    const totalEmployees = empRes[0].totalEmployees;

    // 2. Fetch all approved leaves to compute stats
    const leavesSql = `
      SELECT id, employee_id, leave_type, start_date, end_date, total_days, paid_days, unpaid_days, actual_leave_days
      FROM leave_requests
      WHERE status = 'Approved'
    `;
    db.query(leavesSql, (err2, leaves) => {
      if (err2) {
        console.error("Error fetching approved leaves:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      // We determine the year to show in the Trend chart.
      // Default to the year from the filter (startDate or endDate) if present, otherwise current year
      let trendYear = new Date().getFullYear();
      if (startDate) {
        trendYear = new Date(startDate).getFullYear();
      } else if (endDate) {
        trendYear = new Date(endDate).getFullYear();
      }

      // Filter leaves within the date range for cards and donuts
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      let totalLeavesTaken = 0;
      let paidLeaveTaken = 0;
      let unpaidLeaveTaken = 0;

      const typeDistribution = {};
      const monthlyTrend = {};

      // Initialize monthly trend
      for (let i = 0; i < 12; i++) {
        monthlyTrend[i] = { Medical: 0, Casual: 0, Earned: 0, Others: 0 };
      }

      leaves.forEach((l) => {
        const leaveStart = new Date(l.start_date);
        const leaveEnd = new Date(l.end_date);
        const days = l.actual_leave_days || l.total_days || 0;

        // If it matches the date filter, count it for the summary cards and donuts
        let matchesFilter = true;
        if (start && leaveEnd < start) matchesFilter = false;
        if (end && leaveStart > end) matchesFilter = false;

        if (matchesFilter) {
          totalLeavesTaken += days;
          paidLeaveTaken += l.paid_days || 0;
          unpaidLeaveTaken += l.unpaid_days || 0;

          const type = l.leave_type || "Other";
          typeDistribution[type] = (typeDistribution[type] || 0) + days;
        }

        // Trend chart: must be in the trendYear
        if (leaveStart.getFullYear() === trendYear) {
          const month = leaveStart.getMonth(); // 0-11
          let category = "Others";
          const lt = l.leave_type || "";
          if (lt.includes("Medical") || lt.includes("Sick")) {
            category = "Medical";
          } else if (lt.includes("Casual") || lt.includes("Personal")) {
            category = "Casual";
          } else if (lt.includes("Earned")) {
            category = "Earned";
          }
          monthlyTrend[month][category] += days;
        }
      });

      res.json({
        success: true,
        summary: {
          totalEmployees,
          totalLeavesTaken,
          paidLeaveTaken,
          unpaidLeaveTaken
        },
        typeDistribution,
        monthlyTrend,
        trendYear
      });
    });
  });
});

// ─── Reporting Employees Table Endpoint ──────────────────────────────────────────
router.get("/reports/employees", (req, res) => {
  const { startDate, endDate } = req.query;

  // Fetch all employees
  const empSql = "SELECT id, employee_id, name, department, joining_date, designation, profile_photo FROM users WHERE role = 'employee'";
  db.query(empSql, (err, employees) => {
    if (err) {
      console.error("Error fetching employees for report:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    // Fetch all approved leaves for balance calculations
    const leavesSql = `
      SELECT employee_id, leave_type, start_date, end_date, total_days, paid_days, unpaid_days, actual_leave_days
      FROM leave_requests
      WHERE status = 'Approved'
    `;
    db.query(leavesSql, (err2, leaves) => {
      if (err2) {
        console.error("Error fetching approved leaves for report:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      // Group leaves by employee_id
      const empLeavesMap = {};
      leaves.forEach((l) => {
        if (!empLeavesMap[l.employee_id]) {
          empLeavesMap[l.employee_id] = [];
        }
        empLeavesMap[l.employee_id].push(l);
      });

      const reportData = employees.map((emp) => {
        const empLeaves = empLeavesMap[emp.id] || [];

        // Filter the leaves within active date range to show range-specific usage in table columns
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const filteredLeaves = empLeaves.filter((l) => {
          let matches = true;
          if (start && new Date(l.end_date) < start) matches = false;
          if (end && new Date(l.start_date) > end) matches = false;
          return matches;
        });

        const totalEntitlement = 36;
        
        // Count paid and unpaid days taken within the filtered range
        const paidLeavesTaken = filteredLeaves.reduce((sum, l) => sum + (l.paid_days || 0), 0);
        const unpaidLeavesTaken = filteredLeaves.reduce((sum, l) => sum + (l.unpaid_days || 0), 0);
        const leaveTypesTaken = Array.from(new Set(filteredLeaves.map(l => l.leave_type)));
        
        // Remaining Balance: 36 - SUM(overall annual paid days consumed)
        const overallAnnualPaidUsed = empLeaves.reduce((sum, l) => {
          let annualContributed = l.paid_days || 0;
          if (l.leave_type === "Paternity Leave") {
            annualContributed = Math.max(0, annualContributed - 15);
          } else if (l.leave_type === "Maternity Leave") {
            annualContributed = Math.max(0, annualContributed - 182);
          }
          return sum + annualContributed;
        }, 0);
        
        const remainingBalance = Math.max(0, totalEntitlement - overallAnnualPaidUsed);

        return {
          id: emp.id,
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department,
          joining_date: emp.joining_date,
          designation: emp.designation,
          profile_photo: emp.profile_photo,
          gender: emp.gender,
          totalEntitlement,
          paidLeavesTaken,
          unpaidLeavesTaken,
          remainingBalance,
          leaveTypesTaken
        };
      });

      res.json({
        success: true,
        employees: reportData
      });
    });
  });
});

// ─── Reporting Single Employee Detail Endpoint ──────────────────────────────────────
router.get("/reports/employee/:id", (req, res) => {
  const param = req.params.id;

  // Support both numeric DB id and string employee_id code (e.g. "EMP001")
  const isNumeric = /^\d+$/.test(param);
  const empSql = isNumeric
    ? "SELECT id, employee_id, name, department, joining_date, designation, profile_photo, gender FROM users WHERE id = ? AND role = 'employee'"
    : "SELECT id, employee_id, name, department, joining_date, designation, profile_photo, gender FROM users WHERE employee_id = ? AND role = 'employee'";

  db.query(empSql, [param], (err, empRes) => {
    if (err) {
      console.error("Error fetching employee details:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    if (empRes.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    const emp = empRes[0];

    // Fetch all leave requests (including non-approved for history log)
    const leavesSql = `
      SELECT id, leave_type, start_date, end_date, total_days, paid_days, unpaid_days, status, reason, actual_leave_days, applied_at, payment_type
      FROM leave_requests
      WHERE employee_id = ?
      ORDER BY start_date DESC, id DESC
    `;
    db.query(leavesSql, [emp.id], (err2, leaves) => {
      if (err2) {
        console.error("Error fetching leaves for employee:", err2);
        return res.status(500).json({ success: false, error: err2.message });
      }

      const approvedLeaves = leaves.filter((l) => l.status === "Approved");

      const paidLeavesTaken = approvedLeaves.reduce((sum, l) => sum + (l.paid_days || 0), 0);
      const unpaidLeavesTaken = approvedLeaves.reduce((sum, l) => sum + (l.unpaid_days || 0), 0);

      // Remaining balance = 36 - overall annual paid days consumed
      const annualPaidUsed = approvedLeaves.reduce((sum, l) => {
        let annualContributed = l.paid_days || 0;
        if (l.leave_type === "Paternity Leave") {
          annualContributed = Math.max(0, annualContributed - 15);
        } else if (l.leave_type === "Maternity Leave") {
          annualContributed = Math.max(0, annualContributed - 182);
        }
        return sum + annualContributed;
      }, 0);
      const remainingBalance = Math.max(0, 36 - annualPaidUsed);

      // Leave type usage breakdown for approved leaves
      const leaveTypeUsage = {};
      approvedLeaves.forEach((l) => {
        const type = l.leave_type || "Other";
        const days = l.actual_leave_days || l.total_days || 0;
        leaveTypeUsage[type] = (leaveTypeUsage[type] || 0) + days;
      });

      res.json({
        success: true,
        employee: {
          id: emp.id,
          employee_id: emp.employee_id,
          name: emp.name,
          department: emp.department,
          joining_date: emp.joining_date,
          designation: emp.designation,
          profile_photo: emp.profile_photo,
          gender: emp.gender,
          totalEntitlement: 36,
          paidLeavesTaken,
          unpaidLeavesTaken,
          remainingBalance
        },
        leaveTypeUsage,
        history: leaves.map(l => ({
          ...l,
          start_date: new Date(l.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }),
          end_date: new Date(l.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
        }))
      });
    });
  });
});

module.exports = router;