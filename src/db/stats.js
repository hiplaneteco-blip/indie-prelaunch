import { pool } from './pool.js';

export async function getProfileStats(userId) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM participations WHERE user_id = $1 AND status = 'completed') AS missions_completed,
       (SELECT COUNT(*) FROM feedback f
          JOIN participations p ON p.participation_id = f.participation_id
          WHERE p.user_id = $1) AS feedback_submitted,
       (SELECT COALESCE(SUM(amount), 0) FROM credit_tx WHERE user_id = $1 AND amount > 0) AS credits_earned`,
    [userId]
  );
  return rows[0];
}
