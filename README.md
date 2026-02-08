# Classic Snake

A minimal, classic Snake implementation: grid movement, food, growth, score, game-over, restart — plus a leaderboard backed by a real database.

## Run locally

This project is designed for Vercel Functions. For local work, you can run the Vercel dev server (recommended) or just open the static UI.

Vercel dev (API + UI):

```bash
cd /Users/dragonpc/AiProjects/snake-game
npm install
vercel dev
```

Static-only preview:

```bash
cd /Users/dragonpc/AiProjects/snake-game/public
python3 -m http.server 5173
```

Then visit `http://localhost:3000` (Vercel dev) or `http://localhost:5173` (static preview).

## Controls

- Arrow keys or WASD
- Space: pause/resume
- Restart button
- Submit your score via the leaderboard panel

## Leaderboard API

- `GET /api/leaderboard`: returns the top 10 scores (`[{ name, score, timestamp }]`).
- `POST /api/score`: submit `{ name, score }` and receive the refreshed top 10 in `{ entries }`.

These endpoints run as Vercel Functions from the `api/` directory.

## Database setup (Vercel)

This project uses Postgres via the Vercel Marketplace (recommended: Neon). Once you add the integration, Vercel injects a `DATABASE_URL` environment variable.

The API will auto-create the `scores` table on first request using:

```sql
CREATE TABLE IF NOT EXISTS scores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(16) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Deployment logging

`public/deploy-info.json` records the commit hash, message, and timestamp for every production build. Run `node scripts/update-deploy-info.mjs` before `vercel dev` locally, or configure Vercel to run `npm run vercel-build` during deployments.
