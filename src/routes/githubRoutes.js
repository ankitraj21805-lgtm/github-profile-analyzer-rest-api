/**
 * githubRoutes.js
 *
 * Defines all /api/github routes and maps them to controller functions.
 * No logic lives here — just route definitions.
 */

const express = require("express");
const router = express.Router();
const {
  getFullProfile,
  getRepos,
  getLanguages,
  getProfileScore,
} = require("../controllers/githubController");

// ─── ROUTES ──────────────────────────────────────────────────────────────────

/**
 * GET /api/github/:username
 * Returns full profile summary: user info, repo stats, top languages, recent repos.
 *
 * Example: GET /api/github/torvalds
 */
router.get("/:username", getFullProfile);

/**
 * GET /api/github/:username/repos
 * Returns all public repositories.
 *
 * Query params:
 *   ?sort=updated|stars|forks|name  (default: updated)
 *   ?limit=10                        (default: all repos)
 *
 * Example: GET /api/github/torvalds/repos?sort=stars&limit=5
 */
router.get("/:username/repos", getRepos);

/**
 * GET /api/github/:username/languages
 * Returns language breakdown with byte counts and percentages.
 *
 * Example: GET /api/github/torvalds/languages
 */
router.get("/:username/languages", getLanguages);

/**
 * GET /api/github/:username/score
 * Returns profile score out of 100 with breakdown and suggestions.
 *
 * Example: GET /api/github/torvalds/score
 */
router.get("/:username/score", getProfileScore);

module.exports = router;
