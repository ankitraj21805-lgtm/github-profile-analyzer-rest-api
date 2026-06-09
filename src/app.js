/**
 * app.js
 *
 * Configures the Express application:
 * - Middleware (CORS, JSON parsing)
 * - Routes
 * - 404 and global error handlers
 *
 * This file does NOT start the server. That's server.js's job.
 * This separation makes the app easier to test.
 */

const express = require("express");
const cors = require("cors");

const githubRoutes = require("./routes/githubRoutes");

const app = express();

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded bodies (for form submissions, just in case)
app.use(express.urlencoded({ extended: true }));

// Enable CORS — allows any origin in dev; lock this down in production
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Quick ping to confirm the server is running.
 * Useful for uptime monitors and deployment checks.
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GitHub Profile Analyzer API is running.",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────

app.use("/api/github", githubRoutes);

// ─── ROOT ROUTE ───────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the GitHub Profile Analyzer API",
    documentation: "See README.md for full endpoint documentation.",
    endpoints: {
      health: "GET /api/health",
      fullProfile: "GET /api/github/:username",
      repos: "GET /api/github/:username/repos",
      languages: "GET /api/github/:username/languages",
      score: "GET /api/github/:username/score",
    },
  });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
// Catches any request that didn't match a defined route

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404,
      hint: "Check the API documentation for valid endpoints.",
    },
  });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
// Catches any unhandled errors that reach here via next(error)

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);

  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode === 500
          ? "An unexpected server error occurred."
          : error.message,
      statusCode,
    },
  });
});

module.exports = app;
