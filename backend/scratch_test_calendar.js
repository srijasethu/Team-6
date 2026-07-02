const db = require("./config/db");

const MONTHLY_PAID_LIMIT = 3;

function toMonthKey(d) {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

db.query("SELECT * FROM leave_requests WHERE employee_id = 3 AND status = 'Approved'", (err, approvedLeaves) => {
  if (err) { console.error(err); process.exit(1); }

  console.log("Approved leaves from DB:", approvedLeaves.map(l => ({
    id: l.id,
    leave_type: l.leave_type,
    start_date: l.start_date,
    end_date: l.end_date,
    paid_days: l.paid_days,
    unpaid_days: l.unpaid_days
  })));

  const parseLocal = (dVal) => {
    if (!dVal) return null;
    const d = new Date(dVal);
    if (isNaN(d.getTime())) return null;
    if (typeof dVal === 'string') {
      const parts = dVal.split('T')[0].split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else if (parts[2].length === 4) {
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      }
    }
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const currentYear = 2026;
  const currentMonth = 7; // August

  const monthlyUsed = {};
  const detail = {};
  let paidCount = 0;
  let unpaidCount = 0;

  approvedLeaves.forEach((leave) => {
    const isMaternity = leave.leave_type === "Maternity Leave";
    const isPaternity = leave.leave_type === "Paternity Leave";
    const isBenefitType = isMaternity || isPaternity;
    const maxBenefit = isMaternity ? 182 : 15;
    let benefitCounter = 0;

    let curr = parseLocal(leave.start_date);
    const end = parseLocal(leave.end_date);
    if (!curr || !end) return;

    console.log(`Processing leave ${leave.id}: ${leave.leave_type} from ${curr.toISOString()} to ${end.toISOString()}`);

    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const monthKey = `${yyyy}-${mm}`;

      const isSunday = curr.getDay() === 0;
      const isHoliday = false; // simplify holidays check for now

      if (!isSunday && !isHoliday) {
        let status = "Unpaid";
        if (isBenefitType) {
          benefitCounter++;
          if (benefitCounter <= maxBenefit) {
            status = "Paid";
          } else {
            if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
            if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
              status = "Paid";
              monthlyUsed[monthKey]++;
            }
          }
        } else {
          if (!monthlyUsed[monthKey]) monthlyUsed[monthKey] = 0;
          if (monthlyUsed[monthKey] < MONTHLY_PAID_LIMIT) {
            status = "Paid";
            monthlyUsed[monthKey]++;
          }
        }

        if (curr.getFullYear() === currentYear && curr.getMonth() === currentMonth) {
          detail[dateStr] = status;
          if (status === "Paid") paidCount++;
          else unpaidCount++;
        }
      }
      curr.setDate(curr.getDate() + 1);
    }
  });

  console.log("paidCount:", paidCount);
  console.log("unpaidCount:", unpaidCount);
  process.exit();
});
