const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(envPath) {
  const content = fs.readFileSync(envPath, 'utf8');
  const result = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    result[key] = rest.join('=').trim();
  }
  return result;
}

async function main() {
  const env = loadEnv(path.resolve(__dirname, '..', '.env'));
  const sqlFile = path.resolve(__dirname, '..', '..', 'database.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  const adminClient = new Client({
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT, 10) || 5432,
    user: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD || '',
    database: 'postgres',
  });

  console.log('Conectando a Postgres...');
  await adminClient.connect();

  const targetDb = env.DB_DATABASE || 'control_flotas';
  console.log(`Deteniendo conexiones a ${targetDb}...`);
  await adminClient.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid();`,
    [targetDb],
  );

  console.log(`Recreando base de datos ${targetDb}...`);
  await adminClient.query(`DROP DATABASE IF EXISTS ${targetDb}`);
  await adminClient.query(`CREATE DATABASE ${targetDb}`);
  await adminClient.end();

  const targetClient = new Client({
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT, 10) || 5432,
    user: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD || '',
    database: targetDb,
  });

  console.log(`Aplicando esquema desde ${sqlFile}...`);
  await targetClient.connect();
  await targetClient.query(sql);
  await targetClient.end();

  console.log('Esquema aplicado correctamente.');
}

main().catch((err) => {
  console.error('Error al aplicar el esquema:', err);
  process.exit(1);
});
