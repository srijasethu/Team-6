const db = require("./config/db");
db.query("DELETE FROM leave_requests", (err) => {
  if (err) console.error(err);
  else console.log("Cleared leave_requests table");
  process.exit();
});
