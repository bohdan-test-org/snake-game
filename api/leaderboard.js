import { ensureSchema, getSqlClient } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const sql = getSqlClient();
  if (!sql) {
    res.status(500).json({ message: "DATABASE_URL is not configured." });
    return;
  }

  await ensureSchema(sql);
  const entries = await sql`
    SELECT name, score, created_at AS timestamp
    FROM scores
    ORDER BY score DESC, created_at DESC
    LIMIT 10;
  `;

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(entries);
}
