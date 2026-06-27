const db = require("../config/db");

const sql = "ALTER TABLE leave_requests MODIFY COLUMN payment_type ENUM('Paid', 'Partly Paid', 'Unpaid') DEFAULT 'Paid'";

db.query(sql, (err) => {
  if (err) {
    console.error("❌ Migration failed:", err.message);
  } else {
    console.log("✅ payment_type ENUM updated to include 'Partly Paid'");
  }
  db.end();
});
