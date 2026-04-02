import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    // Ensure _migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const { rows: applied } = await client.query("SELECT name FROM _migrations");
    const appliedSet = new Set(applied.map((r) => r.name));

    const dir = join(__dirname, "migrations");
    const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  skip: ${file} (already applied)`);
        continue;
      }
      const sql = readFileSync(join(dir, file), "utf8");
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`  applied: ${file}`);
    }

    console.log("Migrations complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
