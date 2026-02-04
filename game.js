import { createInitialState, setDirection, step } from "./snakeLogic.js";

const canvas = document.querySelector("#board");
const scoreEl = document.querySelector("#score");
const statusEl = document.querySelector("#status");
const restartBtn = document.querySelector("#restart");
const pauseBtn = document.querySelector("#pause");
const dpad = document.querySelector(".dpad");

const ctx = canvas.getContext("2d");

const COLS = 20;
const ROWS = 20;
const TICK_MS = 120;

let state = createInitialState({ cols: COLS, rows: ROWS });
let timer = null;
let paused = false;

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
