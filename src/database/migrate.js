import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('🔄 Starting database migration and seeding for Crib Society...');

  const connectionUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
  let dbConfig;

  if (connectionUrl) {
    dbConfig = {
      uri: connectionUrl,
      multipleStatements: true,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
    };
  } else {
    dbConfig = {
      host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306', 10),
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD !== undefined
        ? process.env.DB_PASSWORD
        : (process.env.MYSQLPASSWORD || ''),
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || undefined,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };
  }

  const targetDb = process.env.DB_NAME || process.env.MYSQLDATABASE || 'crib_society_db';

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL server.`);

    // 1. Ensure target database exists and is selected
    console.log(`📦 Ensuring database "${targetDb}" exists and is active...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${targetDb}\`;`);

    // 2. Locate SQL file
    const sqlFilePath = fs.existsSync(path.resolve(__dirname, '../../database/crib_society_db.sql'))
      ? path.resolve(__dirname, '../../database/crib_society_db.sql')
      : path.resolve(__dirname, '../../database/database.sql');

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration SQL file not found at: ${sqlFilePath}`);
    }

    let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Adapt database name dynamically if environment uses a different DB name (e.g. crib_society_db on local)
    if (targetDb !== 'railway') {
      sqlContent = sqlContent.replace(/`railway`/g, `\`${targetDb}\``);
    }

    // 3. Prepare clean slate drop statements to prevent "Table already exists" on re-runs
    const dropHeader = `
      SET FOREIGN_KEY_CHECKS = 0;
      DROP TABLE IF EXISTS \`order_status_logs\`;
      DROP TABLE IF EXISTS \`payments\`;
      DROP TABLE IF EXISTS \`order_items\`;
      DROP TABLE IF EXISTS \`orders\`;
      DROP TABLE IF EXISTS \`products\`;
      DROP TABLE IF EXISTS \`categories\`;
      DROP TABLE IF EXISTS \`users\`;
      DROP TABLE IF EXISTS \`store_settings\`;
    `;

    const fullSql = `
      ${dropHeader}
      ${sqlContent}
      SET FOREIGN_KEY_CHECKS = 1;
    `;

    console.log(`📄 Executing ${path.basename(sqlFilePath)}...`);
    await connection.query(fullSql);
    console.log('🎉 Database migration & seed completed successfully!');
    console.log(`Database "${targetDb}" is fully populated and ready for production.`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
