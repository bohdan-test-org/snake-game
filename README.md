# Classic Snake 

A minimal, classic Snake implementation: grid movement, food, growth, score, game-over, restart.

## Run

Install dependencies, run the backend, and open the app:

```bash
cd /Users/dragonpc/AiProjects/snake-game
npm install
npm start
```

Then open `http://localhost:3000` to play. The Express backend serves the UI and exposes the leaderboard API described below.

## Controls

- Arrow keys or WASD
- Space: pause/resume
- Restart button
- Submit your score (when the game is over) via the leaderboard panel

## Leaderboard API

- `GET /api/leaderboard`: returns the top 10 scores (JSON array of `{ name, score, timestamp }`).  
- `POST /api/score`: submit `{ name, score }` (JSON payload) to append your result. The server keeps the top 40 and returns the refreshed top 10.

Scores are stored in `data/leaderboard.json` (created automatically from `data/leaderboard.template.json`). The UI fetches `/api/leaderboard` on load and after each submit; failures are silently ignored so you can still run the front-end as a static preview.

## Deployment logging

`public/deploy-info.json` records the commit hash, message, and timestamp for every production build. Run `node scripts/update-deploy-info.mjs` before `npm start` when testing locally, or rely on the `vercel-build` hook (still configured) to refresh it during automated deployments.
