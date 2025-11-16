const { Pool } = require('pg');

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Please configure your PostgreSQL connection string.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS Pokemon (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      types TEXT NOT NULL,
      sprites TEXT NOT NULL,
      trainer_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE
    )
  `);
};

initDb().catch((err) => {
  console.error('Failed to initialize database', err);
});

module.exports = pool;
