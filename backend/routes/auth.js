const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login", (req, res) => {
    const { email, password, role } = req.body;

    let table = role === "manager" ? "managers" : "employees";

    const sql = `SELECT * FROM ${table} WHERE email = ? AND password = ?`;

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }

        if (result.length > 0) {
            res.json({
                success: true,
                user: result[0]
            });
        } else {
            res.json({
                success: false,
                message: "Invalid Credentials"
            });
        }
    });
});

module.exports = router;