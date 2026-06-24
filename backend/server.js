const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running");
});

app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});

app.get("/test", (req, res) => {
    res.json({
        message: "API working"
    });
});