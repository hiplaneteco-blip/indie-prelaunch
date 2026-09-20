-- Indie Prelaunch bot schema. Run via `npm run migrate`.
-- Statements are idempotent (IF NOT EXISTS) so this is safe to re-run.

CREATE TABLE IF NOT EXISTS users (
  discord_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
  mission_id SERIAL PRIMARY KEY,
  game_name TEXT NOT NULL,
  owner_id TEXT NOT NULL REFERENCES users(discord_id),
  min_minutes INTEGER NOT NULL,
  slots_total INTEGER NOT NULL,
  slots_filled INTEGER NOT NULL DEFAULT 0,
  reward_credits INTEGER NOT NULL,
  -- Charged instead of reward_credits when the mission owner tests their own game.
  credit_cost INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'closed')),
  -- Caller's Discord role names at creation time. Not enforced yet (see README:
  -- role gating starts loose), just tagged for a future real permission check.
  owner_roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS participations (
  participation_id SERIAL PRIMARY KEY,
  mission_id INTEGER NOT NULL REFERENCES missions(mission_id),
  user_id TEXT NOT NULL REFERENCES users(discord_id),
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'completed')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Prevents a tester claiming the same mission twice / double-collecting credit,
  -- enforced at the DB level so a race condition or app bug can't bypass it.
  UNIQUE (mission_id, user_id)
);

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id SERIAL PRIMARY KEY,
  participation_id INTEGER NOT NULL UNIQUE REFERENCES participations(participation_id),
  combat_rating SMALLINT NOT NULL CHECK (combat_rating BETWEEN 1 AND 5),
  ui_rating SMALLINT NOT NULL CHECK (ui_rating BETWEEN 1 AND 5),
  difficulty_rating SMALLINT NOT NULL CHECK (difficulty_rating BETWEEN 1 AND 5),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bugs (
  bug_id SERIAL PRIMARY KEY,
  participation_id INTEGER NOT NULL REFERENCES participations(participation_id),
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_tx (
  tx_id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(discord_id),
  amount INTEGER NOT NULL, -- positive = credit, negative = debit
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_participations_mission ON participations(mission_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON credit_tx(user_id);
