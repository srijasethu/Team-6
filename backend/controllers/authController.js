const db = require("../config/db");
const bcrypt = require("bcryptjs");

const login = (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();
  const role = req.body.role?.toLowerCase().trim();

  // Fetch user by email + role only (not password — bcrypt compare needed)
  const sql = `
    SELECT * FROM users 
    WHERE email = ? 
    AND LOWER(role) = ?
  `;

  db.query(sql, [email, role], (err, result) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result[0];
    const storedPassword = user.password;

    // Check if password is bcrypt hashed or plain text
    const isBcrypt = storedPassword && storedPassword.startsWith("$2");

    if (isBcrypt) {
      bcrypt.compare(password, storedPassword, (bcryptErr, isMatch) => {
        if (bcryptErr) {
          console.error("Bcrypt error:", bcryptErr);
          return res.status(500).json({ success: false, message: "Server error" });
        }
        if (!isMatch) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        return res.json({ success: true, user });
      });
    } else {
      // Plain-text password fallback (legacy users)
      if (password !== storedPassword) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      return res.json({ success: true, user });
    }
  });
};

module.exports = { login };