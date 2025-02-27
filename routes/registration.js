
const express = require("express");
const mysql = require("mysql2/promise");
const { exec } = require("child_process");
require("dotenv").config();

const router = express.Router();

// 🔹 MySQL Database Connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "iPrac1qaz$", // Your MySQL password
  database: process.env.DB_NAME || "fusionpbx",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 🔹 API Route: Check Domain Registration
router.post("/", async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: "Domain is required" });

  try {
    const connection = await pool.getConnection();

    // Get domain_uuid for the given domain
    const [domainRows] = await connection.execute(
      "SELECT domain_uuid FROM v_domains WHERE domain_name = ?",
      [domain]
    );
    if (domainRows.length === 0) {
      connection.release();
      return res.status(404).json({ error: "Domain not found" });
    }
    const domain_uuid = domainRows[0].domain_uuid;

    // Get all extensions for the domain
    const [extensions] = await connection.execute(
      "SELECT extension FROM v_extensions WHERE domain_uuid = ?",
      [domain_uuid]
    );
    connection.release();

    const allExtensions = extensions.map(row => row.extension);

    // Get registered extensions with NAT & LAN IP using FreeSWITCH CLI
    exec(`fs_cli -x "show registrations"`, (error, stdout, stderr) => {
      if (error) {
        console.error("Error executing fs_cli:", error);
        return res.status(500).json({ error: "Failed to retrieve registrations" });
      }

      // Parse FreeSWITCH registration output
      const registeredExtensions = stdout
        .split("\n")
        .slice(1) // Skip the header
        .map(line => {
          const parts = line.split(",");
          if (parts.length >= 8) {
            return {
              extension: parts[0], // reg_user
              lan_ip: parts[2].split("@")[1] || "Unknown", // Extract from token field
              nat_ip: parts[5] || "Unknown", // network_ip
              port: parts[6] || "Unknown", // network_port
              protocol: parts[7] || "Unknown", // network_proto
            };
          }
          return null;
        })
        .filter(ext => ext !== null);

      // Compare lists to find unregistered extensions
      const registeredNumbers = registeredExtensions.map(ext => ext.extension);
      const unregisteredExtensions = allExtensions.filter(ext => !registeredNumbers.includes(ext));

      res.json({
        domain,
        registered: registeredExtensions,
        unregistered: unregisteredExtensions
      });
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; // ✅ Ensure the router is exported correctly
