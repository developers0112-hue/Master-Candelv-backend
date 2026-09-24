import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected successfully! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err instanceof Error ? err.message : String(err));
  } finally {
    await pool.end();
  }
}

checkConnection();