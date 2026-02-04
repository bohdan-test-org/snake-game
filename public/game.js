import { createInitialState, setDirection, step } from "./snakeLogic.js";

const canvas = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restart");
const pauseBtn = document.querySelector("#pause");
const dpad = document.querySelector(".dpad");
const leaderboardForm = document.querySelector("#leaderboard-form");
const leaderboardList = document.querySelector("#leaderboard-list");
const leaderboardFeedback = document.querySelector("#leaderboard-feedback");
const nameInput = document.querySelector("#player-name");
const logRoot = document.querySelector("main") || document.body;
const API_BASE = "/api";

const ctx = canvas.getContext("2d");

const COLS = 20;
const ROWS = 20;
const TICK_MS = 120;

let state = createInitialState({ cols: COLS, rows: ROWS });
let timer = null;
let paused = false;

async function logDeployInfo() {
  try {
    const resp = await fetch(new URL("deploy-info.json", import.meta.url), {
      cache: "no-store",
    });
    if (!resp.ok) throw new Error(resp.statusText);
    const info = await resp.json();
    const msg = `Snake ready — deploy ${info.commit} (${info.message}) @ ${new Date(info.timestamp).toLocaleString()}`;
    console.info(msg);
    const node = document.createElement("p");
    node.className = "deploy-log";
    node.textContent = msg;
    logRoot.appendChild(node);
  } catch (error) {
    console.info("Snake deployment info unavailable", error);
  }
}

function formatLeaderboardEntry(entry, index) {
  const date = new Date(entry.timestamp);
  return `${index + 1}. ${entry.name} — ${entry.score} (${date.toLocaleDateString()})`;
}

function renderLeaderboard(entries = []) {
  if (!leaderboardList) return;
  leaderboardList.innerHTML = "";
  if (!entries.length) {
    leaderboardList.innerHTML = "<li>No scores yet. Be the first!</li>";
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.textContent = formatLeaderboardEntry(entry, index);
    leaderboardList.appendChild(item);
  });
}

function setLeaderboardFeedback(message) {
  if (!leaderboardFeedback) return;
  leaderboardFeedback.textContent = message;
}

async function fetchLeaderboard() {
  if (!leaderboardList) return;
  try {
    const resp = await fetch(`${API_BASE}/leaderboard`, { cache: "no-store" });
    if (!resp.ok) throw new Error(resp.statusText);
    const entries = await resp.json();
    renderLeaderboard(entries);
    setLeaderboardFeedback("");
  } catch (error) {
    renderLeaderboard([]);
    setLeaderboardFeedback("Leaderboard unavailable (offline mode).");
    console.info("Unable to load leaderboard", error);
  }
}

async function submitScore(name, score) {
  if (score <= 0) {
    setLeaderboardFeedback("Score must be greater than zero.");
    return;
  }
  try {
    const resp = await fetch(`${API_BASE}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
    if (!resp.ok) throw new Error(resp.statusText);
    const payload = await resp.json();
    renderLeaderboard(payload.entries);
    setLeaderboardFeedback("Score saved! Leaderboard refreshed.");
  } catch (error) {
    setLeaderboardFeedback("Unable to save score (server unreachable).");
    console.info("Leaderboard save failed", error);
  }
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const displaySize = canvas.clientWidth;
  canvas.width = Math.floor(displaySize * ratio);
  canvas.height = Math.floor(displaySize * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function draw() {
  const size = canvas.clientWidth;
  const cell = size / COLS;

  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = "#faf7f2";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#e6dfd6";
  ctx.lineWidth = 1;
  for (let i = 0; i <= COLS; i += 1) {
    const pos = i * cell;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();
  }
  for (let i = 0; i <= ROWS; i += 1) {
    const pos = i * cell;
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }

  ctx.fillStyle = "#c1121f";
  ctx.fillRect(state.food.x * cell, state.food.y * cell, cell, cell);

  ctx.fillStyle = "#2d6a4f";
  state.snake.forEach((segment, index) => {
    ctx.fillRect(segment.x * cell, segment.y * cell, cell, cell);
    if (index === 0) {
      ctx.strokeStyle = "#1b4332";
      ctx.strokeRect(segment.x * cell, segment.y * cell, cell, cell);
    }
  });
}

function updateStatus() {
  if (!state.alive) {
    statusEl.textContent = "Game over. Press Restart to play again.";
  } else if (paused) {
    statusEl.textContent = "Paused.";
  } else {
    statusEl.textContent = "";
  }
}

function tick() {
  if (paused || !state.alive) return;
  state = step(state);
  scoreEl.textContent = String(state.score);
  draw();
  updateStatus();
}

function startLoop() {
  if (timer) clearInterval(timer);
  timer = setInterval(tick, TICK_MS);
}

function restart() {
  state = createInitialState({ cols: COLS, rows: ROWS });
  paused = false;
  scoreEl.textContent = String(state.score);
  updateStatus();
  draw();
  startLoop();
}

function togglePause() {
  if (!state.alive) return;
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
  updateStatus();
}

function handleDirection(dir) {
  state = setDirection(state, dir);
}

function handleKey(event) {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") handleDirection("up");
  if (key === "arrowdown" || key === "s") handleDirection("down");
  if (key === "arrowleft" || key === "a") handleDirection("left");
  if (key === "arrowright" || key === "d") handleDirection("right");
  if (key === " ") togglePause();
}

function handleDpad(event) {
  const target = event.target.closest("button[data-dir]");
  if (!target) return;
  handleDirection(target.dataset.dir);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  draw();
});

document.addEventListener("keydown", handleKey);
restartBtn.addEventListener("click", restart);
pauseBtn.addEventListener("click", togglePause);
dpad.addEventListener("click", handleDpad);

resizeCanvas();
restart();
logDeployInfo();
fetchLeaderboard();

if (leaderboardForm) {
  leaderboardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!nameInput) return;
    const name = nameInput.value.trim();
    if (!name) {
      setLeaderboardFeedback("Please enter your name.");
      return;
    }
    submitScore(name, state.score);
    nameInput.value = "";
  });
}
