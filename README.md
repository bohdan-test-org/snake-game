# Classic Snake

A minimal, classic Snake implementation: grid movement, food, growth, score, game-over, restart.

## Run

Option 1: open `index.html` directly in a browser.

Option 2 (local dev server):

```bash
cd /Users/dragonpc/AiProjects/snake-game
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

## Controls

- Arrow keys or WASD
- Space: pause/resume
- Restart button

## Deployment logging

`deploy-info.json` records the commit hash, message, and timestamp for each deploy. The `vercel-build` hook (`node scripts/update-deploy-info.mjs`) refreshes it for every Vercel deployment, and the game fetches that file on load to show the active version details.

For local experiments you can rerun `node scripts/update-deploy-info.mjs` before starting the dev server so the UI reflects your latest commit info.
