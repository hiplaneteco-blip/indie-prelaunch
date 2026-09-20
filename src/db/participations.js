import { pool } from './pool.js';

export const DUPLICATE_JOIN = 'DUPLICATE_JOIN';

// Throws a DUPLICATE_JOIN-coded error if this user already joined this
// mission, relying on the DB unique constraint rather than a check-then-insert
// so a race between two nearly-simultaneous /join calls can't double-book.
export async function joinMission(missionId, userId) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO participations (mission_id, user_id) VALUES ($1, $2) RETURNING *`,
      [missionId, userId]
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') {
      const dupErr = new Error('User already joined this mission.');
      dupErr.code = DUPLICATE_JOIN;
      throw dupErr;
    }
    throw err;
  }
}

export async function getParticipation(participationId) {
  const { rows } = await pool.query('SELECT * FROM participations WHERE participation_id = $1', [
    participationId,
  ]);
  return rows[0] ?? null;
}

export async function findParticipation(missionId, userId) {
  const { rows } = await pool.query(
    'SELECT * FROM participations WHERE mission_id = $1 AND user_id = $2',
    [missionId, userId]
  );
  return rows[0] ?? null;
}

export async function markCompleted(participationId) {
  const { rows } = await pool.query(
    `UPDATE participations SET status = 'completed' WHERE participation_id = $1 RETURNING *`,
    [participationId]
  );
  return rows[0] ?? null;
}
