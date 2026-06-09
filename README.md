# GitHub Profile Analyzer REST API

A clean, production-structured Node.js + Express REST API that fetches public GitHub profile data, calculates a developer profile score, and returns actionable improvement suggestions.

Built without a database — pure GitHub REST API integration.

---

## Features

- Fetch any public GitHub user's profile, repositories, and language stats
- Paginated repo fetching — gets **all** repos, not just the first 30
- Profile score out of 100 with a detailed breakdown
- Actionable improvement suggestions for developers
- Clean, consistent JSON responses across all endpoints
- Proper error handling for invalid usernames, rate limits, and network errors

---

## 🌐 Live API Demo

Base URL:

https://github-profile-analyzer-rest-api.onrender.com

### Health Check

https://github-profile-analyzer-rest-api.onrender.com/api/health

### Analyze GitHub Profile

https://github-profile-analyzer-rest-api.onrender.com/api/github/ankitraj21805-lgtm

### Get Repositories

https://github-profile-analyzer-rest-api.onrender.com/api/github/ankitraj21805-lgtm/repos

### Get Top Languages

https://github-profile-analyzer-rest-api.onrender.com/api/github/ankitraj21805-lgtm/languages

### Get Profile Score

https://github-profile-analyzer-rest-api.onrender.com/api/github/ankitraj21805-lgtm/score

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js | HTTP server and routing |
| Axios | GitHub API requests |
| dotenv | Environment variable management |
| cors | Cross-origin resource sharing |
| nodemon | Auto-restart in development |

---

## Project Structure

```
github-profile-analyzer/
├── src/
│   ├── controllers/
│   │   └── githubController.js   # Request handling + response shaping
│   ├── routes/
│   │   └── githubRoutes.js       # Route definitions
│   ├── services/
│   │   └── githubService.js      # All GitHub API calls live here
│   ├── utils/
│   │   └── scoreCalculator.js    # Profile scoring logic
│   └── app.js                    # Express app setup (middleware, routes)
├── server.js                     # Entry point — starts the server
├── package.json
├── .env.example                  # Template for environment variables
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
cd github-profile-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
GITHUB_TOKEN=your_github_personal_access_token_here
NODE_ENV=development
```

> **Why do I need a GitHub token?**
> Without a token, the GitHub API allows only **60 requests per hour** per IP. With a token, you get **5,000 requests per hour**. The token only needs the `public_repo` scope (read-only).
>
> Get one at: https://github.com/settings/tokens

### 4. Start the server

**Development (auto-restart on file changes):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The API will be running at `http://localhost:3000`.

---

## API Endpoints

### Health Check

```
GET /api/health
```

Confirms the server is running. Use this for uptime monitoring.

**Response:**
```json
{
  "success": true,
  "message": "GitHub Profile Analyzer API is running.",
  "version": "1.0.0",
  "timestamp": "2024-06-09T10:30:00.000Z",
  "environment": "development"
}
```

---

### Full Profile Summary

```
GET /api/github/:username
```

Returns profile info, repo statistics, top languages, and the 5 most recently updated repos.

**Example:** `GET /api/github/torvalds`

**Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "username": "torvalds",
      "name": "Linus Torvalds",
      "bio": "Just a kernel hacker",
      "avatarUrl": "https://avatars.githubusercontent.com/u/1024025",
      "profileUrl": "https://github.com/torvalds",
      "location": "Portland, OR",
      "blog": null,
      "twitterUsername": null,
      "followers": 232000,
      "following": 0,
      "publicRepos": 8,
      "accountCreated": "2011-09-03T15:26:22Z",
      "isHireable": false
    },
    "stats": {
      "totalPublicRepos": 8,
      "ownedRepos": 7,
      "forkedRepos": 1,
      "totalStars": 198000,
      "totalForks": 56000
    },
    "topLanguages": [
      { "language": "C", "bytes": 987654321, "percentage": 89.2 },
      { "language": "Makefile", "bytes": 45000000, "percentage": 4.1 }
    ],
    "recentRepos": [
      {
        "name": "linux",
        "description": "Linux kernel source tree",
        "url": "https://github.com/torvalds/linux",
        "stars": 198000,
        "forks": 56000,
        "language": "C",
        "isForked": false,
        "updatedAt": "2024-06-09T08:00:00Z",
        "topics": ["linux", "kernel", "operating-system"]
      }
    ]
  }
}
```

---

### Repositories

```
GET /api/github/:username/repos
```

Returns all public repositories.

**Query Parameters:**

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `sort` | `updated`, `stars`, `forks`, `name` | `updated` | Sort order |
| `limit` | any number | `0` (all) | Limit number of results |

**Example:** `GET /api/github/torvalds/repos?sort=stars&limit=5`

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "totalRepos": 8,
    "showing": 5,
    "sortedBy": "stars",
    "repos": [
      {
        "name": "linux",
        "description": "Linux kernel source tree",
        "url": "https://github.com/torvalds/linux",
        "stars": 198000,
        "forks": 56000,
        "language": "C",
        "isForked": false,
        "updatedAt": "2024-06-09T08:00:00Z",
        "topics": []
      }
    ]
  }
}
```

---

### Language Breakdown

```
GET /api/github/:username/languages
```

Aggregates language usage across all public repositories.

**Example:** `GET /api/github/torvalds/languages`

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "totalBytesAnalyzed": 1105654321,
    "uniqueLanguagesFound": 6,
    "topLanguages": [
      { "language": "C", "bytes": 987654321, "percentage": 89.2 },
      { "language": "Makefile", "bytes": 45000000, "percentage": 4.1 },
      { "language": "Python", "bytes": 30000000, "percentage": 2.7 }
    ]
  }
}
```

---

### Profile Score

```
GET /api/github/:username/score
```

Calculates a profile score out of 100 based on completeness and activity.

**Example:** `GET /api/github/torvalds/score`

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "score": 72,
    "grade": "B — Good",
    "scoreBreakdown": {
      "bio": 10,
      "avatar": 5,
      "location": 5,
      "blog": 0,
      "twitter": 0,
      "repos": 15,
      "stars": 15,
      "repoDescriptions": 7,
      "followers": 10,
      "accountAge": 7,
      "recentActivity": 10
    },
    "suggestions": [
      "Add a website or portfolio link (blog, LinkedIn, personal site).",
      "Link your Twitter/X handle for visibility in the dev community."
    ],
    "scoredAt": "2024-06-09T10:30:00.000Z"
  }
}
```

---

### Scoring Criteria

| Category | Max Points | How to earn |
|----------|-----------|-------------|
| Bio | 10 | Have a non-empty bio |
| Avatar | 5 | Use a custom profile photo |
| Location | 5 | Set your location |
| Blog/Website | 5 | Add a website link |
| Twitter | 3 | Link your Twitter handle |
| Public Repos | 15 | 3 pts per repo (max 5 repos) |
| Stars earned | 15 | 1 pt per star (max 15) |
| Repo descriptions | 10 | % of repos with a description |
| Followers | 10 | 1 pt per 2 followers (max 10) |
| Account age | 7 | 1 pt per year (max 7) |
| Recent activity | 15 | 5 pts per recently active repo (last 90 days, max 3) |

---

## Error Responses

All errors follow the same format:

```json
{
  "success": false,
  "error": {
    "message": "GitHub user \"invalid_user_xyz\" not found.",
    "statusCode": 404
  }
}
```

| Status Code | Cause |
|-------------|-------|
| 404 | Username does not exist on GitHub |
| 429 | GitHub API rate limit exceeded — add a token |
| 401 | Invalid GitHub token in `.env` |
| 503 | Cannot reach the GitHub API (network issue) |
| 500 | Unexpected server error |

---

## Deployment

### Deploy to Render (Free)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables in the Render dashboard:
   - `GITHUB_TOKEN` = your token
   - `NODE_ENV` = production

### Deploy to Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set environment variables via the Railway dashboard.

### Deploy to Heroku

```bash
heroku create your-app-name
heroku config:set GITHUB_TOKEN=your_token
heroku config:set NODE_ENV=production
git push heroku main
```

---

## Local Development Tips

- Use [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/) (VS Code extension) to test endpoints
- The `nodemon` dev server restarts automatically when you save a file
- Keep an eye on GitHub rate limit headers in your terminal logs

---

## Roadmap (Version 2 ideas)

- [ ] Redis caching to avoid redundant GitHub API calls
- [ ] Compare two users side-by-side: `GET /api/github/compare/:user1/:user2`
- [ ] Contribution graph analysis
- [ ] Repo README quality scoring
- [ ] Frontend dashboard

---

## Author

**Ankit Sharma**  
📧 ankitraj21805@gmail.com  
📱 +91-9244076460  
🐙 [github.com/ankitraj21805-lgtm](https://github.com/ankitraj21805-lgtm)

---

## License

MIT — use it however you like.
