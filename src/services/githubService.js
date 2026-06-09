/**
 * githubService.js
 *
 * All direct communication with the GitHub REST API lives here.
 * Controllers never call GitHub directly — they go through this service.
 * This keeps the code modular and easy to test or swap out later.
 */

const axios = require("axios");

// ─── GITHUB API BASE URL ─────────────────────────────────────────────────────
const GITHUB_API = "https://api.github.com";

/**
 * Build Axios request headers.
 * If a GITHUB_TOKEN is set in .env, we send it to get 5000 req/hr instead of 60.
 */
function getHeaders() {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

// ─── SERVICE FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Fetch a user's public profile from GitHub.
 *
 * @param {string} username
 * @returns {Promise<Object>} GitHub user object
 * @throws Will throw an error if the user is not found (404) or rate-limited (403)
 */
async function getUserProfile(username) {
  try {
    const response = await axios.get(`${GITHUB_API}/users/${username}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    // Re-throw with a cleaner message so the controller can handle it properly
    handleGitHubError(error, username);
  }
}

/**
 * Fetch all public repositories for a user.
 * Paginates automatically to get ALL repos (not just the first 30).
 *
 * @param {string} username
 * @returns {Promise<Array>} Array of repository objects
 */
async function getUserRepos(username) {
  try {
    let allRepos = [];
    let page = 1;
    const perPage = 100; // Max GitHub allows per page

    // Keep fetching pages until we get an empty response
    while (true) {
      const response = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
        headers: getHeaders(),
        params: {
          per_page: perPage,
          page: page,
          sort: "updated", // Most recently updated first
          type: "owner",   // Only repos owned by the user (not forks they haven't touched)
        },
      });

      const repos = response.data;

      // If GitHub returned an empty array, we've fetched everything
      if (repos.length === 0) break;

      allRepos = [...allRepos, ...repos];

      // If we got fewer than a full page, this was the last page
      if (repos.length < perPage) break;

      page++;
    }

    return allRepos;
  } catch (error) {
    handleGitHubError(error, username);
  }
}

/**
 * Aggregate language statistics across all repos.
 * GitHub gives us language breakdown per repo — we sum them up here.
 *
 * @param {string} username
 * @param {Array}  repos - Already-fetched repo list (avoids duplicate API calls)
 * @returns {Promise<Object>} e.g. { JavaScript: 45320, Python: 12000, ... }
 */
async function getLanguageStats(username, repos) {
  try {
    const languageTotals = {};

    // Fetch language data for each repo in parallel (much faster than sequential)
    const languageRequests = repos.map((repo) =>
      axios
        .get(`${GITHUB_API}/repos/${username}/${repo.name}/languages`, {
          headers: getHeaders(),
        })
        .then((res) => res.data)
        .catch(() => ({})) // If one repo fails, don't crash the whole request
    );

    const results = await Promise.all(languageRequests);

    // Merge all language maps into one totals object
    results.forEach((langMap) => {
      Object.entries(langMap).forEach(([lang, bytes]) => {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      });
    });

    return languageTotals;
  } catch (error) {
    handleGitHubError(error, username);
  }
}

// ─── ERROR HANDLER ───────────────────────────────────────────────────────────

/**
 * Translate GitHub API errors into clean, readable messages.
 * We throw a plain Error with a message and a statusCode attached to it.
 */
function handleGitHubError(error, username) {
  if (error.response) {
    const status = error.response.status;

    if (status === 404) {
      const err = new Error(`GitHub user "${username}" not found.`);
      err.statusCode = 404;
      throw err;
    }

    if (status === 403) {
      const err = new Error(
        "GitHub API rate limit exceeded. Add a GITHUB_TOKEN to your .env to increase the limit to 5000 requests/hour."
      );
      err.statusCode = 429;
      throw err;
    }

    if (status === 401) {
      const err = new Error(
        "Invalid GitHub token. Check your GITHUB_TOKEN in .env."
      );
      err.statusCode = 401;
      throw err;
    }
  }

  // Unknown / network errors
  const err = new Error(
    "Failed to connect to the GitHub API. Check your network connection."
  );
  err.statusCode = 503;
  throw err;
}

module.exports = {
  getUserProfile,
  getUserRepos,
  getLanguageStats,
};
