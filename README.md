# GitHub Profile Analyzer REST API

A production-structured Node.js + Express REST API that analyzes public GitHub profiles, repository activity, languages, stars, forks, and profile completeness to generate a developer score with improvement suggestions.

## Live API

Base URL:

```txt
https://github-profile-analyzer-rest-api.onrender.com
```

Health check:

```txt
https://github-profile-analyzer-rest-api.onrender.com/api/health
```

Example profile analysis:

```txt
https://github-profile-analyzer-rest-api.onrender.com/api/github/ankitraj21805-lgtm
```

## Overview

This project demonstrates backend API engineering using Express.js and GitHub REST API integration. It fetches real public GitHub data, calculates a profile score, returns a detailed score breakdown, and provides actionable improvement suggestions.

## Features

- Public GitHub profile analysis
- Repository count and activity signals
- Stars, forks, and language stats
- Profile completeness scoring
- Score breakdown out of 100
- Actionable improvement suggestions
- Clean JSON API responses
- Error handling for invalid usernames and API failures
- Render deployment-ready backend

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Backend | Express.js |
| API Integration | GitHub REST API, Axios / Fetch |
| Response Format | JSON |
| Deployment | Render |
| Version Control | Git, GitHub |

## Skills Demonstrated

- REST API design
- Third-party API integration
- Backend routing
- Data aggregation and scoring logic
- Error handling
- Deployment debugging
- API documentation

## Recommended GitHub Topics

```txt
nodejs
express
rest-api
github-api
backend
api-development
render
portfolio-project
json-api
developer-tools
```

## Local Setup

```bash
npm install
npm start
```

## Roadmap

- Add caching layer
- Add database history
- Add frontend dashboard
- Add GitHub OAuth option
- Add more scoring categories

## Author

**Ankit Sharma**

- GitHub: [ankitraj21805-lgtm](https://github.com/ankitraj21805-lgtm)
- LinkedIn: [ankitsharma-frontend](https://www.linkedin.com/in/ankitsharma-frontend/)
- Email: [ankitraj21805@gmail.com](mailto:ankitraj21805@gmail.com)
