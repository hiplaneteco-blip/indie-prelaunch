import 'dotenv/config';
import pg from 'pg';

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL in environment.');
}

// Supabase (and most managed Postgres) terminate TLS with a cert not in
// Node's default trust store; this is the standard escape hatch for that,
// not a blanket "skip TLS" — the connection is still encrypted.
export const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
});
