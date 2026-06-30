const http = require("http");

const payload = JSON.stringify({
  employee_id: 2,
  leave_type: "Maternity Leave",
  start_date: "2026-07-01",
  end_date: "2027-02-12",
  reason: "New maternity split logic test"
});

const options = {
  hostname: "localhost",
  port: 5000,
  path: "/api/leave/apply",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });
  res.on("end", () => {
    console.log("Status Code:", res.statusCode);
    console.log("Response:", JSON.stringify(JSON.parse(data), null, 2));
    process.exit();
  });
});

req.on("error", (err) => {
  console.error("Error:", err);
  process.exit(1);
});

req.write(payload);
req.end();
