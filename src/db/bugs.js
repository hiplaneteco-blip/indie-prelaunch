import { pool } from './pool.js';

export async function insertBug({ participationId, description, severity }) {
  const { rows } = await pool.query(
    `INSERT INTO bugs (participation_id, description, severity)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [participationId, description, severity]
  );
  return rows[0];
}

export async function listBugsForMission(missionId) {
  const { rows } = await pool.query(
    `SELECT b.* FROM bugs b
     JOIN participations p ON p.participation_id = b.participation_id
     WHERE p.mission_id = $1
     ORDER BY b.created_at ASC`,
    [missionId]
  );
  return rows;
}
