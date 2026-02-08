import { ensureSchema, getSqlClient } from "../lib/db.js";

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return null;
    }
  }
  return null;
}

function sanitizeName(value) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 16);
}

function sanitizeScore(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.floor(parsed);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sql = getSqlClient();
  if (!sql) {
    res.status(500).json({ message: "DATABASE_URL is not configured." });
    return;
  }

  const payload = parseBody(req);
  const name = sanitizeName(payload?.name);
  const score = sanitizeScore(payload?.score);

  if (!name || score === null) {
    res.status(400).json({ message: "Name and score are required." });
    return;
  }

  await ensureSchema(sql);
  await sql`
    INSERT INTO scores (name, score)
    VALUES (${name}, ${score});
  `;

  const entries = await sql`
    SELECT name, score, created_at AS timestamp
    FROM scores
    ORDER BY score DESC, created_at DESC
    LIMIT 10;
  `;

  res.setHeader("Cache-Control", "no-store");
  res.status(201).json({ entries });
}
