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

  // Schema check & migrations
  connection.query("SHOW COLUMNS FROM users LIKE 'notifications_enabled'", (errCol, results) => {
    if (errCol) {
      console.error("Failed to check users columns:", errCol);
      return;
    }
    if (results.length === 0) {
      connection.query("ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE", (errAlter) => {
        if (errAlter) {
          console.error("Failed to add notifications_enabled column to users table:", errAlter);
        } else {
          console.log("Successfully added notifications_enabled column to users table");
        }
      });
    }
  });

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(120) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('info','success','warning','error') DEFAULT 'info',
      category VARCHAR(60),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `;
  connection.query(createNotificationsTable, (errTable) => {
    if (errTable) {
      console.error("Failed to create notifications table:", errTable);
    } else {
      console.log("Verified/Created notifications table successfully");
    }
  });
});

module.exports = connection;