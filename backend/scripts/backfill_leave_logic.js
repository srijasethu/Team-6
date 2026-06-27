/**
 * Backfill Script: Recalculate paid_days / unpaid_days / payment_type / alert_message
 * for ALL existing leave_requests using the 6-days-per-month paid quota rule.
 *
 * Rules:
 *  - Process each employee's Approved/Pending leaves in chronological order.
 *  - First 6 leave-days per calendar month → Paid.
 *  - 7th day onward in the same month → Unpaid.
 *  - Rejected / Cancelled leaves do NOT consume the monthly quota.
 *  - payment_type:
 *      paid > 0, unpaid = 0  → 'Paid'
 *      paid > 0, unpaid > 0  → 'Partly Paid'
 *      paid = 0, unpaid > 0  → 'Unpaid'
 *
 * Run:  node scripts/backfill_leave_logic.js
 */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Srija@110803",
  database: "leave_management",
});

db.connect((err) => {
  if (err) { console.error("❌ DB connect failed:", err.message); process.exit(1); }
  console.log("✅ MySQL Connected\n");
  runBackfill();
});

function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function resolvePaymentMeta(paid, unpaid) {
  if (paid > 0 && unpaid === 0)
    return { payment_type: "Paid", alert_message: null };
  if (paid > 0 && unpaid > 0)
    return {
      payment_type: "Partly Paid",
      alert_message: "This leave is partly unpaid because your monthly paid leave limit is 6 days.",
    };
  return {
    payment_type: "Unpaid",
    alert_message: "This is an unpaid leave because your monthly paid leave limit is already used.",
  };
}

function runBackfill() {
  const fetchSql = `
    SELECT id, employee_id, start_date, end_date, status
    FROM leave_requests
    ORDER BY employee_id ASC, start_date ASC, id ASC
  `;

  db.query(fetchSql, (err, rows) => {
    if (err) { console.error("❌ Fetch error:", err.message); db.end(); return; }

    console.log(`📋 Found ${rows.length} leave request(s).\n`);
    if (!rows.length) { db.end(); return; }

    // Group by employee
    const byEmployee = {};
    rows.forEach((r) => {
      (byEmployee[r.employee_id] = byEmployee[r.employee_id] || []).push(r);
    });

    const updates = [];

    for (const leaves of Object.values(byEmployee)) {
      // Monthly counters: track how many days have been counted as paid so far
      const counters = {};  // { 'YYYY-MM': number }

      for (const leave of leaves) {
        const countForQuota =
          leave.status === "Approved" || leave.status === "Pending";

        let paid = 0, unpaid = 0, total = 0;
        let curr = new Date(leave.start_date);
        const end = new Date(leave.end_date);

        while (curr <= end) {
          const mk = toMonthKey(curr);
          if (!counters[mk]) counters[mk] = 0;

          if (countForQuota) {
            if (counters[mk] < 6) { paid++;   counters[mk]++; }
            else                  { unpaid++;                  }
          } else {
            // Rejected / Cancelled: show as paid for display, don't consume quota
            paid++;
          }
          total++;
          curr.setDate(curr.getDate() + 1);
        }

        const { payment_type, alert_message } = resolvePaymentMeta(paid, unpaid);
        updates.push({ id: leave.id, total, paid, unpaid, payment_type, alert_message });
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
         SET total_days=?, paid_days=?, unpaid_days=?, payment_type=?, alert_message=?
         WHERE id=?`,
        [u.total, u.paid, u.unpaid, u.payment_type, u.alert_message, u.id],
        (err) => {
          if (err) {
            console.error(`  ❌ id=${u.id}: ${err.message}`);
            failed++;
          } else {
            console.log(
              `  ✔ id=${String(u.id).padStart(4)} | total=${u.total} | paid=${u.paid} | unpaid=${u.unpaid} | ${u.payment_type}`
            );
            done++;
          }
          next(i + 1);
        }
      );
    };
    next(0);
  });
}
