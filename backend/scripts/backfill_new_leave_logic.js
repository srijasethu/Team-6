/**
 * backfill_new_leave_logic.js
 * Recalculates paid_days / unpaid_days / payment_type / alert_message
 * for ALL existing Pending + Approved leave_requests using the corrected rules:
 *
 *   Paternity Leave:  first 15 actual days = Paternity Benefit, remainder uses monthly balance, then Unpaid
 *   Maternity Leave:  first 182 actual days = Maternity Benefit, remainder uses monthly balance, then Unpaid
 *   Personal / Medical Leave: up to 3 actual days per calendar month = Paid, beyond = Unpaid
 *
 * Run:  node scripts/backfill_new_leave_logic.js
 */

const db = require("../config/db");

const MONTHLY_PAID_LIMIT = 3;
const BENEFIT_TYPES = { "Maternity Leave": 182, "Paternity Leave": 15 };

function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function resolvePaymentMeta(paid, unpaid, leaveType, benefitDays, monthlyPaidDays) {
  if (leaveType === "Maternity Leave" || leaveType === "Paternity Leave") {
    const typeName = leaveType === "Maternity Leave" ? "Maternity" : "Paternity";
    const parts = [];
    if (benefitDays > 0) parts.push(`${benefitDays} ${typeName}`);
    if (monthlyPaidDays > 0) parts.push(`${monthlyPaidDays} Monthly`);
    if (unpaid > 0) parts.push(`${unpaid} Unpaid`);
    const breakdownStr = parts.join(" + ");
    if (unpaid === 0) {
      return { payment_type: "Paid", alert_message: breakdownStr || null };
    }
    return { payment_type: "Partly Paid", alert_message: breakdownStr };
  }

  if (paid > 0 && unpaid === 0)
    return { payment_type: "Paid", alert_message: null };
  if (paid > 0 && unpaid > 0)
    return {
      payment_type: "Partly Paid",
      alert_message: "This leave is partly unpaid because your monthly paid leave limit is exceeded.",
    };
  return {
    payment_type: "Unpaid",
    alert_message: "This leave is unpaid because your monthly paid leave limit has already been used.",
  };
}

db.connect((err) => {
  if (err) { console.error("❌ DB connect failed:", err.message); process.exit(1); }
  console.log("✅ MySQL Connected\n");

  const holidaysSql = "SELECT DATE_FORMAT(holiday_date, '%Y-%m-%d') AS holiday_date FROM company_holidays";
  db.query(holidaysSql, (hErr, holidayRows) => {
    const holidayDates = new Set();
    if (!hErr && holidayRows) holidayRows.forEach(r => holidayDates.add(r.holiday_date));
    console.log(`📅 Loaded ${holidayDates.size} company holidays\n`);

    const fetchSql = `
      SELECT id, employee_id, start_date, end_date, leave_type
      FROM leave_requests
      WHERE status IN ('Pending', 'Approved')
      ORDER BY employee_id ASC, start_date ASC, id ASC
    `;
    db.query(fetchSql, (err, rows) => {
      if (err) { console.error("❌ Fetch error:", err.message); db.end(); return; }
      console.log(`📋 Found ${rows.length} active leave request(s).\n`);
      if (!rows.length) { db.end(); return; }

      // Group by employee, process chronologically
      const byEmployee = {};
      rows.forEach(r => (byEmployee[r.employee_id] = byEmployee[r.employee_id] || []).push(r));

      const updates = [];
      for (const leaves of Object.values(byEmployee)) {
        const monthlyUsed = {};

        for (const leave of leaves) {
          let paid = 0, unpaid = 0, total = 0, excluded = 0, actual = 0;
          let benefitCounter = 0, benefitDays = 0, monthlyPaidDays = 0;
          const maxBenefit = BENEFIT_TYPES[leave.leave_type] || 0;
          const isBenefit = maxBenefit > 0;

          let curr = new Date(leave.start_date);
          const end = new Date(leave.end_date);

          while (curr <= end) {
            total++;
            const yyyy = curr.getFullYear();
            const mm = String(curr.getMonth() + 1).padStart(2, "0");
            const dd = String(curr.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            const isSunday = curr.getDay() === 0;
            const isHoliday = holidayDates.has(dateStr);

            if (isSunday || isHoliday) {
              excluded++;
            } else {
              actual++;
              const mk = toMonthKey(curr);
              if (!monthlyUsed[mk]) monthlyUsed[mk] = 0;

              if (isBenefit) {
                benefitCounter++;
                if (benefitCounter <= maxBenefit) {
                  paid++; benefitDays++;
                } else {
                  if (monthlyUsed[mk] < MONTHLY_PAID_LIMIT) {
                    paid++; monthlyPaidDays++; monthlyUsed[mk]++;
                  } else {
                    unpaid++;
                  }
                }
              } else {
                if (monthlyUsed[mk] < MONTHLY_PAID_LIMIT) {
                  paid++; monthlyUsed[mk]++;
                } else {
                  unpaid++;
                }
              }
            }
            curr.setDate(curr.getDate() + 1);
          }

          const { payment_type, alert_message } = resolvePaymentMeta(paid, unpaid, leave.leave_type, benefitDays, monthlyPaidDays);
          updates.push({ id: leave.id, total, excluded, actual, paid, unpaid, payment_type, alert_message });
        }
      }

      console.log(`🔄 Updating ${updates.length} row(s)...\n`);
      let done = 0, failed = 0;

      const next = (i) => {
        if (i >= updates.length) {
          console.log(`\n✅ Done.  Updated: ${done}  |  Failed: ${failed}`);
          db.end();
          return;
        }
        const u = updates[i];
        db.query(
          `UPDATE leave_requests
           SET total_days=?, excluded_days=?, actual_leave_days=?, paid_days=?, unpaid_days=?, payment_type=?, alert_message=?
           WHERE id=?`,
          [u.total, u.excluded, u.actual, u.paid, u.unpaid, u.payment_type, u.alert_message, u.id],
          (err) => {
            if (err) {
              console.error(`  ❌ id=${u.id}: ${err.message}`);
              failed++;
            } else {
              const breakdown = u.alert_message || `${u.paid}P + ${u.unpaid}U`;
              console.log(`  ✔ id=${String(u.id).padStart(4)} | actual=${u.actual} | paid=${u.paid} | unpaid=${u.unpaid} | ${u.payment_type} | ${breakdown}`);
              done++;
            }
            next(i + 1);
          }
        );
      };
      next(0);
    });
  });
});
