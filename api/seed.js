import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const GROWTH_PHASES = [
  { id: "seed", label: "Seedling", range: "1–10 eng", desc: "Founding team. Every hire is existential. You ARE the culture.", accent: "#E07A3A" },
  { id: "startup", label: "Sprout", range: "10–50 eng", desc: "First real teams forming. Culture is either intentional or accidental now.", accent: "#7BC67E" },
  { id: "scaleup", label: "Vine", range: "50–200 eng", desc: "Growing fast. Without structure, things get tangled. Process emerges.", accent: "#5AA8D5" },
  { id: "growth", label: "Canopy", range: "200–1K eng", desc: "Multiple layers, multiple teams. Org design is a product decision.", accent: "#C4A0E8" },
  { id: "enterprise", label: "Forest", range: "1K+ eng", desc: "Ecosystem scale. Mature systems, defending culture while innovating.", accent: "#E8C85A" },
];

const NAV_ALL = [
  { id: "attract", num: "01", label: "Attract", short: "Employer brand & pipeline" },
  { id: "select", num: "02", label: "Select", short: "Evaluate & close" },
  { id: "launch", num: "03", label: "Launch", short: "Onboard to first impact" },
  { id: "equip", num: "04", label: "Equip", short: "Tools & platforms" },
  { id: "grow", num: "05", label: "Grow", short: "Careers & development" },
  { id: "ship", num: "06", label: "Ship", short: "Delivery & reliability" },
  { id: "thrive", num: "07", label: "Thrive", short: "Retention & culture" },
  { id: "evolve", num: "08", label: "Evolve", short: "Offboarding & alumni" },
];

const KIND = {
  essential: { l: "Essential", c: "#E07A3A" },
  playbook: { l: "Playbook", c: "#5AA8D5" },
  framework: { l: "Framework", c: "#5DAE72" },
  toolkit: { l: "Toolkit", c: "#B08AD6" },
  template: { l: "Template", c: "#7BC67E" },
  artifact: { l: "Artifact", c: "#D4A843" },
  policy: { l: "Policy", c: "#D47B8A" },
};

const RC = { A: "#E07A3A", R: "#5DAE72", C: "#B08AD6", I: "#8A8878" };

// Import LATTICE data from main file dynamically
async function loadLattice() {
  // We read the techtrellis.jsx and extract the LATTICE array
  const { readFileSync } = await import("fs");
  const { join, dirname } = await import("path");
  const { fileURLToPath } = await import("url");
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const src = readFileSync(join(__dirname, "..", "techtrellis.jsx"), "utf8");

  // Extract LATTICE array between "const LATTICE = [" and the matching "];"
  const start = src.indexOf("const LATTICE = [");
  const coreStart = src.indexOf("[", start);

  // Find the matching close bracket by counting nesting
  let depth = 0;
  let end = coreStart;
  for (let i = coreStart; i < src.length; i++) {
    if (src[i] === "[") depth++;
    if (src[i] === "]") depth--;
    if (depth === 0) { end = i + 1; break; }
  }

  const latticeStr = src.slice(coreStart, end);
  // Convert JS object syntax to something eval-able
  const lattice = eval(latticeStr);
  return lattice;
}

async function seed() {
  const client = await pool.connect();
  const LATTICE = await loadLattice();

  try {
    await client.query("BEGIN");

    // Clear existing data
    await client.query("DELETE FROM phase_content");
    await client.query("DELETE FROM stages");
    await client.query("DELETE FROM growth_phases");
    await client.query("DELETE FROM artifact_kinds");
    await client.query("DELETE FROM raci_types");

    // Seed growth_phases
    for (let i = 0; i < GROWTH_PHASES.length; i++) {
      const gp = GROWTH_PHASES[i];
      await client.query(
        "INSERT INTO growth_phases (id, label, range, description, accent, sort_order) VALUES ($1,$2,$3,$4,$5,$6)",
        [gp.id, gp.label, gp.range, gp.desc, gp.accent, i]
      );
    }
    console.log("  seeded: growth_phases");

    // Seed stages (merge LATTICE core data with NAV_ALL)
    for (let i = 0; i < LATTICE.length; i++) {
      const stage = LATTICE[i];
      const nav = NAV_ALL.find((n) => n.id === stage.id);
      await client.query(
        "INSERT INTO stages (id, num, label, short, core, sort_order) VALUES ($1,$2,$3,$4,$5,$6)",
        [stage.id, stage.num, stage.label, nav?.short || "", stage.core, i]
      );
    }
    console.log("  seeded: stages");

    // Seed artifact_kinds
    for (const [id, val] of Object.entries(KIND)) {
      await client.query(
        "INSERT INTO artifact_kinds (id, label, color) VALUES ($1,$2,$3)",
        [id, val.l, val.c]
      );
    }
    console.log("  seeded: artifact_kinds");

    // Seed raci_types
    for (const [code, color] of Object.entries(RC)) {
      await client.query(
        "INSERT INTO raci_types (code, color) VALUES ($1,$2)",
        [code, color]
      );
    }
    console.log("  seeded: raci_types");

    // Seed phase_content
    let count = 0;
    for (const stage of LATTICE) {
      for (const [phaseId, data] of Object.entries(stage.phases)) {
        await client.query(
          `INSERT INTO phase_content (stage_id, phase_id, reality, goals, metrics, team, artifacts, dx, avoid)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            stage.id,
            phaseId,
            data.reality,
            JSON.stringify(data.goals),
            JSON.stringify(data.metrics),
            JSON.stringify(data.team),
            JSON.stringify(data.artifacts),
            data.dx,
            JSON.stringify(data.avoid),
          ]
        );
        count++;
      }
    }
    console.log(`  seeded: phase_content (${count} rows)`);

    await client.query("COMMIT");
    console.log("Seed complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
