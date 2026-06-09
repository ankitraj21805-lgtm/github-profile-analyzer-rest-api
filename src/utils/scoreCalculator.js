/**
 * scoreCalculator.js
 *
 * Calculates a GitHub profile score out of 100 based on
 * public profile completeness and repository activity.
 * Also generates actionable improvement suggestions.
 */

/**
 * calculateProfileScore
 *
 * @param {Object} profile  - Raw GitHub user object from the API
 * @param {Array}  repos    - Array of public repository objects
 * @returns {{ score: number, breakdown: Object, suggestions: string[] }}
 */
function calculateProfileScore(profile, repos) {
  let score = 0;
  const breakdown = {}; // tracks points earned per category
  const suggestions = [];

  // ─── 1. BIO / DESCRIPTION (10 points) ───────────────────────────────────
  if (profile.bio && profile.bio.trim().length > 0) {
    score += 10;
    breakdown.bio = 10;
  } else {
    breakdown.bio = 0;
    suggestions.push("Add a bio to your profile — recruiters read it first.");
  }

  // ─── 2. PROFILE PHOTO (5 points) ────────────────────────────────────────
  // GitHub assigns a default avatar URL when no photo is set.
  // We detect it by checking for "avatars.githubusercontent.com/u/" without custom upload.
  const hasCustomAvatar =
    profile.avatar_url && !profile.avatar_url.includes("identicons");
  if (hasCustomAvatar) {
    score += 5;
    breakdown.avatar = 5;
  } else {
    breakdown.avatar = 0;
    suggestions.push("Upload a profile photo — it adds credibility.");
  }

  // ─── 3. LOCATION (5 points) ──────────────────────────────────────────────
  if (profile.location && profile.location.trim().length > 0) {
    score += 5;
    breakdown.location = 5;
  } else {
    breakdown.location = 0;
    suggestions.push("Add your location to help local recruiters find you.");
  }

  // ─── 4. BLOG / WEBSITE (5 points) ────────────────────────────────────────
  if (profile.blog && profile.blog.trim().length > 0) {
    score += 5;
    breakdown.blog = 5;
  } else {
    breakdown.blog = 0;
    suggestions.push(
      "Add a website or portfolio link (blog, LinkedIn, personal site)."
    );
  }

  // ─── 5. TWITTER / SOCIAL (3 points) ──────────────────────────────────────
  if (profile.twitter_username && profile.twitter_username.trim().length > 0) {
    score += 3;
    breakdown.twitter = 3;
  } else {
    breakdown.twitter = 0;
    suggestions.push("Link your Twitter/X handle for visibility in the dev community.");
  }

  // ─── 6. PUBLIC REPOSITORIES (15 points) ──────────────────────────────────
  // 5+ repos = full marks; scaled below that
  const repoCount = profile.public_repos || 0;
  const repoPoints = Math.min(15, repoCount * 3); // 3 pts per repo, max 15
  score += repoPoints;
  breakdown.repos = repoPoints;
  if (repoCount < 5) {
    suggestions.push(
      `You have ${repoCount} public repo(s). Push more projects — aim for at least 5 to 10.`
    );
  }

  // ─── 7. STARS EARNED (15 points) ─────────────────────────────────────────
  const totalStars = repos.reduce(
    (sum, repo) => sum + (repo.stargazers_count || 0),
    0
  );
  // 1 pt per star, max 15
  const starPoints = Math.min(15, totalStars);
  score += starPoints;
  breakdown.stars = starPoints;
  if (totalStars === 0) {
    suggestions.push(
      "None of your repos have stars yet. Share your work on Reddit, Dev.to, or LinkedIn."
    );
  }

  // ─── 8. README USAGE (10 points) ─────────────────────────────────────────
  // Check what % of repos have a description (a proxy for having a README / docs)
  const reposWithDescription = repos.filter(
    (repo) => repo.description && repo.description.trim().length > 0
  ).length;
  const descRatio =
    repos.length > 0 ? reposWithDescription / repos.length : 0;
  const descPoints = Math.round(descRatio * 10);
  score += descPoints;
  breakdown.repoDescriptions = descPoints;
  if (descRatio < 0.5) {
    suggestions.push(
      "More than half your repos have no description. Add a one-liner to each — it takes 10 seconds."
    );
  }

  // ─── 9. FOLLOWERS (10 points) ─────────────────────────────────────────────
  const followers = profile.followers || 0;
  // 1 pt per 2 followers, max 10
  const followerPoints = Math.min(10, Math.floor(followers / 2));
  score += followerPoints;
  breakdown.followers = followerPoints;
  if (followers < 10) {
    suggestions.push(
      "Grow your follower count by contributing to open-source projects and engaging with the community."
    );
  }

  // ─── 10. ACCOUNT AGE (7 points) ───────────────────────────────────────────
  const createdAt = new Date(profile.created_at);
  const ageInYears =
    (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
  // 1 pt per year of account age, max 7
  const agePoints = Math.min(7, Math.floor(ageInYears));
  score += agePoints;
  breakdown.accountAge = agePoints;

  // ─── 11. RECENT ACTIVITY (15 points) ──────────────────────────────────────
  // Check if any repo was pushed to in the last 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentlyActive = repos.filter(
    (repo) => new Date(repo.pushed_at) > ninetyDaysAgo
  ).length;
  // 5 pts per recently active repo, max 15
  const activityPoints = Math.min(15, recentlyActive * 5);
  score += activityPoints;
  breakdown.recentActivity = activityPoints;
  if (recentlyActive === 0) {
    suggestions.push(
      "No recent activity in the last 90 days. Push commits regularly — even small updates help."
    );
  }

  // ─── FINAL SCORE CAP ──────────────────────────────────────────────────────
  score = Math.min(100, Math.round(score));

  // ─── GRADE ────────────────────────────────────────────────────────────────
  let grade;
  if (score >= 80) grade = "A — Excellent";
  else if (score >= 60) grade = "B — Good";
  else if (score >= 40) grade = "C — Average";
  else grade = "D — Needs Improvement";

  return {
    score,
    grade,
    breakdown,
    suggestions: suggestions.length > 0 ? suggestions : ["Great profile! Keep contributing."],
  };
}

module.exports = { calculateProfileScore };
