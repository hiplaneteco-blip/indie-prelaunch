import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pool } from './pool.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

try {
  await pool.query(schema);
  logger.info('Schema applied successfully.');
} catch (err) {
  logger.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
