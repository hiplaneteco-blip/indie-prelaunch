import { pool } from './pool.js';

export async function getOrCreateUser(discordId, username) {
  const { rows } = await pool.query(
    `INSERT INTO users (discord_id, username)
     VALUES ($1, $2)
     ON CONFLICT (discord_id) DO UPDATE SET username = EXCLUDED.username
     RETURNING *`,
    [discordId, username]
  );
  return rows[0];
}

export async function getUser(discordId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE discord_id = $1', [discordId]);
  return rows[0] ?? null;
}
