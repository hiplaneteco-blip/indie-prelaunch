# Indie Prelaunch Bot

Discord bot for the Indie Prelaunch community: mission-based playtesting, credit
tracking, and AI-generated feedback summaries. Replaces the manual Google Sheet
+ copy-pasted announcements pipeline.

First real workload: HiPlanet: Save The Earth demo testing with the internal
team, as a pipeline check before opening the server to external indie devs.

## Stack

- Node.js + discord.js (slash commands)
- PostgreSQL (Supabase free tier is fine to start)
- Claude API for per-mission feedback summaries
- Railway or Render for always-on hosting

## Setup

```bash
npm install
cp .env.example .env
# fill in DISCORD_TOKEN, DISCORD_CLIENT_ID, DATABASE_URL, ANTHROPIC_API_KEY
```

`DISCORD_GUILD_ID` is optional but recommended during development: guild-scoped
commands register instantly, global commands take up to an hour to propagate.
Set it to the Indie Prelaunch server's ID while building, unset it once ready
to go global.

Register slash commands with Discord:

```bash
npm run deploy-commands
```

Run the bot:

```bash
npm start
```

## Build status

Built incrementally, each step verified before moving to the next (steps 1-4
against a real local Postgres instance driving the actual command code;
step 4's outbound Claude call itself still needs a real API key to verify
against live output — everything around it, including the failure-fallback
path, is verified):

1. **Skeleton** (done) — bot connects, all 7 commands are registered and
   respond, no database yet.
2. **Missions + join** (done) — `MISSIONS` / `PARTICIPATIONS` tables,
   `/create-test`, `/missions`, `/join`.
3. **Feedback + credit** (done) — `FEEDBACK` / `BUGS` / `CREDIT_TX` tables,
   `/feedback`, `/bug`, `/credits`, `/profile`, unique-join constraint,
   credit-on-feedback logic.
4. **AI summary** (done, needs a real `ANTHROPIC_API_KEY` to fully verify) —
   Claude API call fires when a mission's `slots_filled` reaches
   `slots_total`; posts a Combat/UI/Difficulty summary to the channel. Note:
   this fires on the join that fills the last slot, not on every tester
   having submitted `/feedback` — see the comment in
   `src/services/mission-summary.js`.
5. **Deploy** (done) — `Procfile` / `railway.json` for Railway,
   `render.yaml` for Render. See below.

### Still needs from you before this runs live

- A Discord bot application (token + client ID) invited to the Indie
  Prelaunch server with the `applications.commands` and `bot` scopes.
- A Postgres database (e.g. Supabase) — run `npm run migrate` once against it.
- An Anthropic API key for step 4.

None of these exist in this build environment, so steps 1-4 were verified
against a local, disposable Postgres instance and mocked Discord/Claude
interactions rather than the live server — worth a real end-to-end smoke test
in the actual channel once secrets are in place.

## Deploying

**Railway**: connect the repo, it picks up `railway.json` (Nixpacks build,
`npm start`). Set `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `DATABASE_URL`,
`ANTHROPIC_API_KEY` in the service's Variables tab, then run
`railway run npm run migrate` once against the deployed `DATABASE_URL` before
(or right after) the first deploy.

**Render**: connect the repo, it picks up `render.yaml` (background worker,
runs `npm run migrate` as a pre-deploy command on every deploy — safe to
repeat since the schema is all `CREATE ... IF NOT EXISTS`). Fill in the four
env vars as secrets in the dashboard (`sync: false` in `render.yaml` means
Render won't ask you to commit them).

Either way, once deployed run `npm run deploy-commands` once (locally, with
the deployed `.env` values) to register the slash commands with Discord —
that's a one-time registration call, not part of the running process.

## Data model

See `src/db/schema.sql` once step 2 lands. Key business rules:

- **No duplicate credit**: `PARTICIPATIONS` has a unique constraint on
  `(mission_id, user_id)` enforced at the database level, so a race condition
  or bug can't double-pay a tester.
- **Credit timing**: credit is granted only on `/feedback` submission, not on
  `/join` — the incentive is tied to completing the test, not just claiming a
  slot.
- **Self-test asymmetry**: `MISSIONS` has both `reward_credits` (paid to a
  tester who completes feedback on someone else's game) and `credit_cost`
  (charged to the mission owner if they test their own game). Testing your
  own game costs credit; testing someone else's earns it.
- **Role gating**: `/create-test` is open to anyone for now — the caller's
  Discord roles are tagged on the mission rather than hard-enforced. Tighten
  this once external (non-employee) developers join and abuse becomes
  possible.

## Deferred (not in this build)

- Real-money credit purchases (PayPal/Stripe) — add once external demand
  shows up.
- Final AI summary prompt — needs a first real batch of feedback/bug text to
  tune against.
- Website / developer dashboard — Discord is the whole product for now.
