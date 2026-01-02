import mysql, { Pool } from 'mysql2/promise';

// Use env vars (fallbacks kept for local dev)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'bhavya',
  password: process.env.DB_PASSWORD || 'abcdef',
  database: process.env.DB_NAME || 'digital_wardrobe',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool: Pool | null = null;

export async function connectToDatabase(): Promise<Pool> {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('Created MySQL pool');
  }
  return pool;
}

// Optional: clean up on process exit (best-effort)
process.on('exit', async () => {
  if (pool) {
    try { await pool.end(); console.log('DB pool closed'); } catch (e) {}
  }
});