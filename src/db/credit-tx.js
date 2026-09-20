import { pool } from './pool.js';

// Updates the user's balance and logs the ledger row in one transaction, so a
// crash between the two never leaves credits and credit_tx disagreeing.
// amount is signed: positive credits the user, negative debits them.
export async function applyCredit(userId, amount, reason) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `UPDATE users SET credits = credits + $1 WHERE discord_id = $2 RETURNING *`,
      [amount, userId]
    );
    await client.query(`INSERT INTO credit_tx (user_id, amount, reason) VALUES ($1, $2, $3)`, [
      userId,
      amount,
      reason,
    ]);
    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getCreditHistory(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM credit_tx WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return rows;
}
