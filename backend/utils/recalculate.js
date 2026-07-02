/**
 * recalculate.js
 * Shared utility: recalculate paid_days / unpaid_days / payment_type / alert_message
 * for every Pending + Approved leave of a given employee.
 *
 * Call this after ANY leave status change:
 *   - apply (new leave inserted)
 *   - cancel (employee cancels)
 *   - approve (manager approves)
 *   - reject  (manager rejects)
 *
 * Business Rules:
 *   Personal / Medical Leave:
 *     - Up to MONTHLY_PAID_LIMIT actual leave days per calendar month are Paid.
 *     - Beyond that → Unpaid.
 *
 *   Paternity Leave:
 *     - First 15 actual leave days are paid under Paternity Benefit.
 *     - Any days beyond 15 draw from the monthly paid leave balance.
 *     - Only after monthly balance is exhausted do days become Unpaid.
 *
 *   Maternity Leave:
 *     - First 182 actual leave days are paid under Maternity Benefit.
 *     - Any days beyond 182 draw from the monthly paid leave balance.
 *     - Only after monthly balance is exhausted do days become Unpaid.
 */

const MONTHLY_PAID_LIMIT = 3;
const ANNUAL_PAID_ALLOCATION = 36;

// Leave types that receive a fixed benefit quota before monthly balance is used
const BENEFIT_TYPES = {
  "Maternity Leave": 182,
  "Paternity Leave": 15,
};

function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function resolvePaymentMeta(paid, unpaid, leaveType, benefitDays, monthlyPaidDays) {
  // Build breakdown string for benefit leave types
  if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
    const typeName = leaveType === "Maternity Leave" ? "Maternity" : "Paternity";
    const parts = [];
    if (benefitDays > 0) parts.push(`${benefitDays} ${typeName}`);
    if (monthlyPaidDays > 0) parts.push(`${monthlyPaidDays} Monthly`);
    if (unpaid > 0) parts.push(`${unpaid} Unpaid`);
    const breakdownStr = parts.join(" + ");

    if (unpaid === 0) {
      return {
        payment_type: "Paid",
        alert_message: breakdownStr || null,
      };
    }
    return {
      payment_type: "Partly Paid",
      alert_message: breakdownStr,
    };
  }

  if (paid === 0 && unpaid === 0) {
    return { payment_type: "Paid", alert_message: null };
  }
  if (paid > 0 && unpaid === 0) {
    return { payment_type: "Paid", alert_message: null };
  }
  if (paid > 0 && unpaid > 0) {
    return {
      payment_type: "Partly Paid",
      alert_message:
        "This leave is partly unpaid because your monthly paid leave limit is exceeded.",
    };
  }
  // paid === 0 && unpaid > 0
  return {
    payment_type: "Unpaid",
    alert_message:
      "This leave is unpaid because your monthly paid leave limit has already been used.",
  };
}

/**
 * recalculateForEmployee
 * @param {number} employeeId
 * @param {object} db  – mysql connection / pool
 * @param {function} callback(err)
 */
function recalculateForEmployee(employeeId, db, callback) {
  // 1. Fetch all Pending + Approved leaves sorted chronologically
  const fetchSql = `
    SELECT id, start_date, end_date, leave_type
    FROM leave_requests
    WHERE employee_id = ?
      AND status IN ('Pending', 'Approved')
    ORDER BY start_date ASC, id ASC
  `;

  db.query(fetchSql, [employeeId], (fetchErr, leaves) => {
    if (fetchErr) return callback(fetchErr);
    if (!leaves || leaves.length === 0) return callback(null);

    // Fetch all holidays from database to integrate data
    const holidaysSql = "SELECT DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date FROM company_holidays";
    db.query(holidaysSql, (holidaysErr, holidayRows) => {
      const holidayDates = new Set();
      if (!holidaysErr && holidayRows) {
        holidayRows.forEach(row => {
          holidayDates.add(row.holiday_date);
        });
      }

      // monthlyUsed tracks how many paid days have been assigned from the monthly
      // quota for each calendar month (across ALL leave types including overflow
      // from Maternity/Paternity benefit).
      const monthlyUsed = {}; // { 'YYYY-MM': numberOfMonthlyPaidDaysUsedSoFar }

      const updates = leaves.map((leave) => {
        let paid = 0;
        let unpaid = 0;
        let total_calendar = 0;
        let excluded = 0;
        let actual_leave = 0;
        let benefitDaysUsed = 0;    // days covered by Maternity/Paternity benefit
        let monthlyPaidDaysUsed = 0; // days covered by monthly balance for this leave
        let benefitCounter = 0;      // working-day counter against the benefit quota

        const maxBenefitDays = BENEFIT_TYPES[leave.leave_type] || 0;
        const isBenefitType = maxBenefitDays > 0;

        let curr = new Date(leave.start_date);
        const end = new Date(leave.end_date);

        while (curr <= end) {
          total_calendar++;
          const yyyy = curr.getFullYear();
          const mm = String(curr.getMonth() + 1).padStart(2, "0");
          const dd = String(curr.getDate()).padStart(2, "0");
          const dateStr = `${yyyy}-${mm}-${dd}`;

          const isSunday = curr.getDay() === 0;
          const isHoliday = holidayDates.has(dateStr);

          if (isSunday || isHoliday) {
            excluded++;
          } else {
            actual_leave++;
            const mk = toMonthKey(curr);
            if (!monthlyUsed[mk]) monthlyUsed[mk] = 0;

            if (isBenefitType) {
              benefitCounter++;
              if (benefitCounter <= maxBenefitDays) {
                // Still within benefit quota — fully paid by benefit
                paid++;
                benefitDaysUsed++;
              } else {
                // Benefit exhausted — try monthly paid balance
                if (monthlyUsed[mk] < MONTHLY_PAID_LIMIT) {
                  paid++;
                  monthlyPaidDaysUsed++;
                  monthlyUsed[mk]++;
                } else {
                  unpaid++;
                }
              }
            } else {
              // Personal/Medical: counted against monthly paid leave limit
              if (monthlyUsed[mk] < MONTHLY_PAID_LIMIT) {
                paid++;
                monthlyUsed[mk]++;
              } else {
                unpaid++;
              }
            }
          }
          curr.setDate(curr.getDate() + 1);
        }

        const { payment_type, alert_message } = resolvePaymentMeta(
          paid, unpaid, leave.leave_type, benefitDaysUsed, monthlyPaidDaysUsed
        );

        return {
          id: leave.id,
          paid,
          unpaid,
          total: total_calendar,
          excluded,
          actual_leave,
          payment_type,
          alert_message,
        };
      });

      // 3. Bulk-update each leave in the DB
      let remaining = updates.length;
      let firstErr = null;

      updates.forEach((u) => {
        const updateSql = `
          UPDATE leave_requests
          SET paid_days         = ?,
              unpaid_days       = ?,
              total_days        = ?,
              excluded_days     = ?,
              actual_leave_days = ?,
              payment_type      = ?,
              alert_message     = ?
          WHERE id = ?
        `;
        db.query(
          updateSql,
          [u.paid, u.unpaid, u.total, u.excluded, u.actual_leave, u.payment_type, u.alert_message, u.id],
          (updateErr) => {
            if (updateErr && !firstErr) firstErr = updateErr;
            remaining--;
            if (remaining === 0) callback(firstErr);
          }
        );
      });
    });
  });
}

module.exports = { recalculateForEmployee, MONTHLY_PAID_LIMIT, ANNUAL_PAID_ALLOCATION };
