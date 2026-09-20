import { pool } from './pool.js';

export async function insertFeedback({
  participationId,
  combatRating,
  uiRating,
  difficultyRating,
  comments,
}) {
  const { rows } = await pool.query(
    `INSERT INTO feedback (participation_id, combat_rating, ui_rating, difficulty_rating, comments)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [participationId, combatRating, uiRating, difficultyRating, comments]
  );
  return rows[0];
}

export async function listFeedbackForMission(missionId) {
  const { rows } = await pool.query(
    `SELECT f.* FROM feedback f
     JOIN participations p ON p.participation_id = f.participation_id
     WHERE p.mission_id = $1
     ORDER BY f.created_at ASC`,
    [missionId]
  );
  return rows;
}
