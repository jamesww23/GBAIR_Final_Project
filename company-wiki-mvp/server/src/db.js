const { Pool } = require('pg');

const dbUrl = process.env.DB_PUBLIC_URL || process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL;
console.log('Connecting to DB host:', new URL(dbUrl).hostname);
const pool = new Pool({ connectionString: dbUrl });

pool.on('error', (err) => {
  console.error('Unexpected pool error:', err);
  process.exit(1);
});

module.exports = pool;
