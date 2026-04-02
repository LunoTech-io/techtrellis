CREATE TABLE IF NOT EXISTS growth_phases (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  range TEXT NOT NULL,
  description TEXT NOT NULL,
  accent TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS stages (
  id TEXT PRIMARY KEY,
  num TEXT NOT NULL,
  label TEXT NOT NULL,
  short TEXT NOT NULL,
  core TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS artifact_kinds (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS raci_types (
  code TEXT PRIMARY KEY,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS phase_content (
  id SERIAL PRIMARY KEY,
  stage_id TEXT NOT NULL REFERENCES stages(id),
  phase_id TEXT NOT NULL REFERENCES growth_phases(id),
  reality TEXT NOT NULL,
  goals JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '[]',
  team JSONB NOT NULL DEFAULT '[]',
  artifacts JSONB NOT NULL DEFAULT '[]',
  dx TEXT NOT NULL DEFAULT '',
  avoid JSONB NOT NULL DEFAULT '[]',
  UNIQUE (stage_id, phase_id)
);

CREATE TABLE IF NOT EXISTS _migrations (
  name TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
