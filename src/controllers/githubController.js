/**
 * githubController.js
 *
 * Handles incoming HTTP requests, calls the service layer,
 * shapes the response, and sends it back.
 *
 * Rule: NO direct GitHub API calls here. All data fetching goes through githubService.js.
 */

const githubService = require("../services/githubService");
const { calculateProfileScore } = require("../utils/scoreCalculator");

// ─── HELPER: Sort language map by byte count and return top N ────────────────
function getTopLanguages(languageTotals, limit = 5) {
  const total = Object.values(languageTotals).reduce((a, b) => a + b, 0);

  return Object.entries(languageTotals)
    .sort((a, b) => b[1] - a[1]) // Sort descending by byte count
    .slice(0, limit)
    .map(([language, bytes]) => ({
      language,
      bytes,
      percentage: total > 0 ? parseFloat(((bytes / total) * 100).toFixed(1)) : 0,
    }));
}

// ─── HELPER: Shape a repo object to only include what we need ────────────────
function formatRepo(repo) {
  return {
    name: repo.name,
    description: repo.description || "No description provided.",
    url: repo.html_url,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    language: repo.language || "Not specified",
    isForked: repo.fork,
    updatedAt: repo.updated_at,
    topics: repo.topics || [],
  };
}

// ─── CONTROLLERS ─────────────────────────────────────────────────────────────

/**
 * GET /api/github/:username
 * Full profile summary: user info + repo stats + top languages + recent repos
 */
async function getFullProfile(req, res) {
  const { username } = req.params;

  try {
    // Fetch profile and repos in parallel — faster than sequential
    const [profile, repos] = await Promise.all([
      githubService.getUserProfile(username),
      githubService.getUserRepos(username),
    ]);

    // Fetch language stats using already-fetched repos (no extra profile call)
    const languageTotals = await githubService.getLanguageStats(username, repos);

    // Aggregate repo statistics
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
    const ownedRepos = repos.filter((r) => !r.fork);
    const forkedRepos = repos.filter((r) => r.fork);

    // Get 5 most recently updated repos for the "recent activity" section
    const recentRepos = repos
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 5)
      .map(formatRepo);

    const topLanguages = getTopLanguages(languageTotals);

    const response = {
      success: true,
      data: {
        profile: {
          username: profile.login,
          name: profile.name || "Name not set",
          bio: profile.bio || "No bio provided.",
          avatarUrl: profile.avatar_url,
          profileUrl: profile.html_url,
          company: profile.company || null,
          location: profile.location || null,
          blog: profile.blog || null,
          twitterUsername: profile.twitter_username || null,
          email: profile.email || null,
          followers: profile.followers,
          following: profile.following,
          publicRepos: profile.public_repos,
          publicGists: profile.public_gists,
          accountCreated: profile.created_at,
          lastUpdated: profile.updated_at,
          isHireable: profile.hireable || false,
        },
        stats: {
          totalPublicRepos: repos.length,
          ownedRepos: ownedRepos.length,
          forkedRepos: forkedRepos.length,
          totalStars,
          totalForks,
        },
        topLanguages,
        recentRepos,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    return handleControllerError(res, error);
  }
}

/**
 * GET /api/github/:username/repos
 * Returns all public repositories with clean formatting
 */
async function getRepos(req, res) {
  const { username } = req.params;

  // Optional query params: ?sort=stars&limit=10
  const sortBy = req.query.sort || "updated"; // updated | stars | forks | name
  const limit = parseInt(req.query.limit) || 0; // 0 = return all

  try {
    const repos = await githubService.getUserRepos(username);

    // Sort repos based on query param
    let sorted = [...repos];
    if (sortBy === "stars") sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
    else if (sortBy === "forks") sorted.sort((a, b) => b.forks_count - a.forks_count);
    else if (sortBy === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)); // default: updated

    const result = limit > 0 ? sorted.slice(0, limit) : sorted;

    return res.status(200).json({
      success: true,
      data: {
        username,
        totalRepos: repos.length,
        showing: result.length,
        sortedBy: sortBy,
        repos: result.map(formatRepo),
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

/**
 * GET /api/github/:username/languages
 * Returns language breakdown with percentages
 */
async function getLanguages(req, res) {
  const { username } = req.params;

  try {
    const repos = await githubService.getUserRepos(username);
    const languageTotals = await githubService.getLanguageStats(username, repos);

    const topLanguages = getTopLanguages(languageTotals, 10); // Top 10

    const totalBytes = Object.values(languageTotals).reduce((a, b) => a + b, 0);

    return res.status(200).json({
      success: true,
      data: {
        username,
        totalBytesAnalyzed: totalBytes,
        uniqueLanguagesFound: Object.keys(languageTotals).length,
        topLanguages,
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

/**
 * GET /api/github/:username/score
 * Returns a profile score out of 100 with suggestions
 */
async function getProfileScore(req, res) {
  const { username } = req.params;

  try {
    const [profile, repos] = await Promise.all([
      githubService.getUserProfile(username),
      githubService.getUserRepos(username),
    ]);

    const { score, grade, breakdown, suggestions } = calculateProfileScore(
      profile,
      repos
    );

    return res.status(200).json({
      success: true,
      data: {
        username,
        score,
        grade,
        scoreBreakdown: breakdown,
        suggestions,
        scoredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
}

// ─── SHARED ERROR HANDLER ────────────────────────────────────────────────────

/**
 * Sends a consistent error response.
 * Uses statusCode attached to the error by the service layer when available.
 */
function handleControllerError(res, error) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500
      ? "An unexpected server error occurred. Please try again."
      : error.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
    },
  });
}

module.exports = {
  getFullProfile,
  getRepos,
  getLanguages,
  getProfileScore,
};
