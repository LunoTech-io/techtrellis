import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();

// Postgres with SSL support for Railway
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("railway")
    ? { rejectUnauthorized: false }
    : false,
});

// CORS: restrict to frontend origin in production
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: allowedOrigins
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) cb(null, true);
          else cb(new Error("Not allowed by CORS"));
        }
      : "*",
  })
);

// Simple rate limiter: per-IP, in-memory
const rateLimit = new Map();
const RATE_WINDOW = 60_000; // 1 minute
const RATE_MAX = 60; // requests per window

app.use((req, res, next) => {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip;
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimit.set(ip, { start: now, count: 1 });
    return next();
  }

  entry.count++;
  if (entry.count > RATE_MAX) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
});

// Clean up rate limit map every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimit) {
    if (now - entry.start > RATE_WINDOW) rateLimit.delete(ip);
  }
}, 300_000);

// Security headers
app.use((_req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  res.set("X-Frame-Options", "DENY");
  res.set("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Meta: growth phases, stages, artifact kinds, RACI types
app.get("/api/meta", async (_req, res) => {
  try {
    const [phases, stages, kinds, raci] = await Promise.all([
      pool.query("SELECT id, label, range, description, accent FROM growth_phases ORDER BY sort_order"),
      pool.query("SELECT id, num, label, short, core FROM stages ORDER BY sort_order"),
      pool.query("SELECT id, label, color FROM artifact_kinds"),
      pool.query("SELECT code, color FROM raci_types"),
    ]);

    const artifactKinds = {};
    for (const row of kinds.rows) {
      artifactKinds[row.id] = { l: row.label, c: row.color };
    }

    const raciTypes = {};
    for (const row of raci.rows) {
      raciTypes[row.code] = row.color;
    }

    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json({
      growthPhases: phases.rows.map((r) => ({
        id: r.id,
        label: r.label,
        range: r.range,
        desc: r.description,
        accent: r.accent,
      })),
      stages: stages.rows.map((r) => ({
        id: r.id,
        num: r.num,
        label: r.label,
        short: r.short,
        core: r.core,
      })),
      artifactKinds,
      raciTypes,
    });
  } catch (err) {
    console.error("GET /api/meta error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// All content (bulk load)
app.get("/api/content", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT stage_id, phase_id, reality, goals, metrics, team, artifacts, dx, avoid FROM phase_content"
    );

    const content = {};
    for (const row of rows) {
      const key = `${row.stage_id}.${row.phase_id}`;
      content[key] = {
        reality: row.reality,
        goals: row.goals,
        metrics: row.metrics,
        team: row.team,
        artifacts: row.artifacts,
        dx: row.dx,
        avoid: row.avoid,
      };
    }

    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json(content);
  } catch (err) {
    console.error("GET /api/content error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Single cell
app.get("/api/content/:stageId/:phaseId", async (req, res) => {
  try {
    const { stageId, phaseId } = req.params;
    const { rows } = await pool.query(
      "SELECT reality, goals, metrics, team, artifacts, dx, avoid FROM phase_content WHERE stage_id = $1 AND phase_id = $2",
      [stageId, phaseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.json(rows[0]);
  } catch (err) {
    console.error("GET /api/content/:stageId/:phaseId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`TechTrellis API listening on port ${PORT}`);
});
