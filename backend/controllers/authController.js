const db = require("../config/db");

const login = (req, res) => {
  const { email, password, role } = req.body;

  const sql =
    "SELECT * FROM users WHERE email = ? AND password = ? AND role = ?";

  db.query(sql, [email, password, role], (err, result) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (result.length > 0) {
      res.json({
        success: true,
        user: result[0],
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  });
};

module.exports = { login };