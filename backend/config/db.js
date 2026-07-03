const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || "railway",
  port: process.env.MYSQLPORT,
});

connection.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
    return;
  }
  console.log("MySQL Connected to database:", process.env.MYSQLDATABASE || "railway");
});

module.exports = connection;