import { pool } from './pool.js';

export async function createMission({
  gameName,
  ownerId,
  minMinutes,
  slotsTotal,
  rewardCredits,
  creditCost,
  ownerRoles,
}) {
  const { rows } = await pool.query(
    `INSERT INTO missions
       (game_name, owner_id, min_minutes, slots_total, reward_credits, credit_cost, owner_roles)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [gameName, ownerId, minMinutes, slotsTotal, rewardCredits, creditCost, ownerRoles]
  );
  return rows[0];
}

export async function listOpenMissions() {
  const { rows } = await pool.query(
    `SELECT * FROM missions WHERE status = 'open' ORDER BY created_at ASC`
  );
  return rows;
}

export async function getMissionById(missionId) {
  const { rows } = await pool.query('SELECT * FROM missions WHERE mission_id = $1', [missionId]);
  return rows[0] ?? null;
}

// Bumps slots_filled and flips status to 'full' once the mission is full, all
// in one round trip so two testers joining at once can't both slip past a
// slots_total check done in application code.
export async function fillSlot(missionId) {
  const { rows } = await pool.query(
    `UPDATE missions
     SET slots_filled = slots_filled + 1,
         status = CASE WHEN slots_filled + 1 >= slots_total THEN 'full' ELSE status END
     WHERE mission_id = $1
     RETURNING *`,
    [missionId]
  );
  return rows[0] ?? null;
}
