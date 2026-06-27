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
 */

const MONTHLY_PAID_LIMIT = 3;
const ANNUAL_PAID_ALLOCATION = 36;

function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function resolvePaymentMeta(paid, unpaid) {
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
    SELECT id, start_date, end_date
    FROM leave_requests
    WHERE employee_id = ?
      AND status IN ('Pending', 'Approved')
    ORDER BY start_date ASC, id ASC
  `;

  db.query(fetchSql, [employeeId], (fetchErr, leaves) => {
    if (fetchErr) return callback(fetchErr);
    if (!leaves || leaves.length === 0) return callback(null);

    // 2. Walk each leave in chronological order, tracking monthly paid usage
    const monthlyUsed = {}; // { 'YYYY-MM': numberOfPaidDaysAllocatedSoFar }

    const updates = leaves.map((leave) => {
      let paid = 0;
      let unpaid = 0;

      let curr = new Date(leave.start_date);
      const end = new Date(leave.end_date);

      while (curr <= end) {
        const mk = toMonthKey(curr);
        if (!monthlyUsed[mk]) monthlyUsed[mk] = 0;

        if (monthlyUsed[mk] < MONTHLY_PAID_LIMIT) {
          paid++;
          monthlyUsed[mk]++;
        } else {
          unpaid++;
        }
        curr.setDate(curr.getDate() + 1);
      }

      const total = paid + unpaid;
      const { payment_type, alert_message } = resolvePaymentMeta(paid, unpaid);

      return { id: leave.id, paid, unpaid, total, payment_type, alert_message };
    });

    // 3. Bulk-update each leave in the DB
    let remaining = updates.length;
    let firstErr = null;

    updates.forEach((u) => {
      const updateSql = `
        UPDATE leave_requests
        SET paid_days    = ?,
            unpaid_days  = ?,
            total_days   = ?,
            payment_type = ?,
            alert_message = ?
        WHERE id = ?
      `;
      db.query(
        updateSql,
        [u.paid, u.unpaid, u.total, u.payment_type, u.alert_message, u.id],
        (updateErr) => {
          if (updateErr && !firstErr) firstErr = updateErr;
          remaining--;
          if (remaining === 0) callback(firstErr);
        }
      );
    });
  });
}

module.exports = { recalculateForEmployee, MONTHLY_PAID_LIMIT, ANNUAL_PAID_ALLOCATION };
