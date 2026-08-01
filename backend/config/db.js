const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 5000,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => {
  console.log('Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error PostgreSQL:', err);
});

const origQuery = pool.query.bind(pool);
pool.query = (text, params) => {
  const start = process.hrtime.bigint();
  return origQuery(text, params).finally(() => {
    const durMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (durMs > 200) {
      console.log(`[sql:slow] ${durMs.toFixed(0)}ms: ${String(text).slice(0, 120)}`);
    }
  });
};

module.exports = { pool };
