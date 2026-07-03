const db = require("../config/db");

const login = (req, res) => {
  const email = req.body.email?.trim();
  const password = req.body.password?.trim();
  const role = req.body.role?.toLowerCase().trim();

  const sql = `
    SELECT * FROM users 
    WHERE email = ? 
    AND password = ? 
    AND LOWER(role) = ?
  `;

  db.query(sql, [email, password, role], (err, result) => {
    if (err) {
      console.error("Login DB error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length > 0) {
      return res.json({
        success: true,
        user: result[0],
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  });
};

module.exports = { login };