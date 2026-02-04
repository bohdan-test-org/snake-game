import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PUBLIC_DIR = resolve(__dirname, "public");
const DATA_DIR = resolve(__dirname, "data");
const TEMPLATE_PATH = resolve(DATA_DIR, "leaderboard.template.json");
const STORE_PATH = resolve(DATA_DIR, "leaderboard.json");

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORE_PATH)) {
    const fallback = existsSync(TEMPLATE_PATH) ? readFileSync(TEMPLATE_PATH, "utf-8") : "[]";
    writeFileSync(STORE_PATH, fallback);
  }
}

function loadLeaderboard() {
  ensureDataDir();
  const raw = readFileSync(STORE_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.error("Unable to parse leaderboard file", error);
  }
  return [];
}

function persistLeaderboard(entries) {
  ensureDataDir();
  writeFileSync(STORE_PATH, JSON.stringify(entries, null, 2));
}

function sanitizeScore(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

const app = express();
app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get("/api/leaderboard", (req, res) => {
  const board = loadLeaderboard();
  const ordered = board
    .slice()
    .sort((a, b) => b.score - a.score || new Date(b.timestamp) - new Date(a.timestamp));
  res.json(ordered.slice(0, 10));
});

app.post("/api/score", (req, res) => {
  const name = typeof req.body.name === "string" ? req.body.name.trim().slice(0, 16) : "";
  const score = sanitizeScore(req.body.score);
  if (!name || score === null) {
    res.status(400).json({ message: "Name and score are required." });
    return;
  }

  const board = loadLeaderboard();
  const entry = { name, score, timestamp: new Date().toISOString() };
  board.push(entry);
  const ordered = board
    .sort((a, b) => b.score - a.score || new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 40);
  persistLeaderboard(ordered);

  res.status(201).json({
    entries: ordered.slice(0, 10),
  });
});

app.get("*", (req, res) => {
  res.sendFile(join(PUBLIC_DIR, "index.html"));
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Snake backend listening on http://localhost:${port}`);
});
