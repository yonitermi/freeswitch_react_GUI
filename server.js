const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "http://18.192.226.48:3000" }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Import API routes
const callFlowRoutes = require("./routes/call_flow");
const registrationRoutes = require("./routes/registration");

// Use routes
app.use("/api/call-flow", callFlowRoutes);
app.use("/api/check-registration", registrationRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
