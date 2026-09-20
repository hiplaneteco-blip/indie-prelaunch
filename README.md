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

This is being built and tested incrementally against the live Indie Prelaunch
server, one step at a time:

1. **Skeleton** (done) — bot connects, all 7 commands are registered and
   respond, no database yet. Every command currently replies with a
   placeholder saying which later step wires it up.
2. **Missions + join** — `MISSIONS` / `PARTICIPATIONS` tables, `/create-test`,
   `/missions`, `/join`.
3. **Feedback + credit** — `FEEDBACK` / `BUGS` / `CREDIT_TX` tables,
   `/feedback`, `/bug`, `/credits`, `/profile`, unique-join constraint,
   credit-on-feedback logic.
4. **AI summary** — Claude API call fires when a mission's `slots_filled`
   reaches `slots_total`; posts a Combat/UI/Difficulty summary to the channel.
5. **Deploy** — move off a local machine onto Railway/Render.

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
