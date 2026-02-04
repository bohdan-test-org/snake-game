const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

function createInitialState({ cols, rows }, rand = Math.random) {
  const start = { x: Math.floor(cols / 2), y: Math.floor(rows / 2) };
  const snake = [start, { x: start.x - 1, y: start.y }];
  const food = spawnFood({ cols, rows, snake }, rand);

  return {
    cols,
    rows,
    snake,
    dir: "right",
    nextDir: "right",
    food,
    score: 0,
    alive: true,
    grow: 0,
  };
}

function setDirection(state, nextDir) {
  if (!DIRECTIONS[nextDir]) return state;
  if (OPPOSITE[state.dir] === nextDir) return state;
  return { ...state, nextDir };
}

function step(state, rand = Math.random) {
  if (!state.alive) return state;

  const dir = state.nextDir;
  const vector = DIRECTIONS[dir];
  const head = state.snake[0];
  const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

  if (
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.cols ||
    nextHead.y >= state.rows
  ) {
    return { ...state, alive: false };
  }

  const hitsBody = state.snake.some(
    (segment, index) =>
      index !== state.snake.length - 1 &&
      segment.x === nextHead.x &&
      segment.y === nextHead.y
  );

  if (hitsBody) {
    return { ...state, alive: false };
  }

  const nextSnake = [nextHead, ...state.snake];
  let grow = state.grow;
  let score = state.score;
  let food = state.food;

  if (nextHead.x === food.x && nextHead.y === food.y) {
    score += 1;
    grow += 1;
    food = spawnFood({ cols: state.cols, rows: state.rows, snake: nextSnake }, rand);
  }

  if (grow > 0) {
    grow -= 1;
  } else {
    nextSnake.pop();
  }

  return {
    ...state,
    dir,
    snake: nextSnake,
    score,
    food,
    grow,
  };
}

function spawnFood({ cols, rows, snake }, rand = Math.random) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  const open = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) open.push({ x, y });
    }
  }

  if (open.length === 0) return { x: 0, y: 0 };
  const idx = Math.floor(rand() * open.length);
  return open[idx];
}

export { createInitialState, setDirection, step, spawnFood };
