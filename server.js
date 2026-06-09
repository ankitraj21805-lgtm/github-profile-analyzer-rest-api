/**
 * server.js
 *
 * Entry point for the application.
 * Loads environment variables, then starts the Express server.
 */

// Load .env variables FIRST — before anything else imports them
require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

const server = app.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log("  GitHub Profile Analyzer API");
  console.log("─────────────────────────────────────────────");
  console.log(`  Status   : Running`);
  console.log(`  Port     : ${PORT}`);
  console.log(`  Env      : ${ENV}`);
  console.log(`  Token    : ${process.env.GITHUB_TOKEN ? "Set ✓" : "Not set (60 req/hr limit)"}`);
  console.log("─────────────────────────────────────────────");
  console.log(`  Health   : http://localhost:${PORT}/api/health`);
  console.log(`  Example  : http://localhost:${PORT}/api/github/torvalds`);
  console.log("─────────────────────────────────────────────");
});

// Graceful shutdown — clean up open connections on CTRL+C or process kill
process.on("SIGTERM", () => {
  console.log("\nSIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
