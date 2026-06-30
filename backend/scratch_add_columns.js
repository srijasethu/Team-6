const db = require("./config/db");

const checkAndAddColumns = () => {
  db.query("SHOW COLUMNS FROM leave_requests LIKE 'excluded_days'", (err, results) => {
    if (err) {
      console.error("Error checking columns:", err);
      process.exit(1);
    }
    if (results.length === 0) {
      db.query("ALTER TABLE leave_requests ADD COLUMN excluded_days INT NOT NULL DEFAULT 0", (err2) => {
        if (err2) console.error("Error adding excluded_days:", err2);
        else console.log("Added excluded_days column successfully");
        
        db.query("ALTER TABLE leave_requests ADD COLUMN actual_leave_days INT NOT NULL DEFAULT 0", (err3) => {
          if (err3) console.error("Error adding actual_leave_days:", err3);
          else console.log("Added actual_leave_days column successfully");
          process.exit();
        });
      });
    } else {
      console.log("Columns already exist");
      process.exit();
    }
  });
};

checkAndAddColumns();
