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
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };
  }

  const targetDb = process.env.DB_NAME || process.env.MYSQLDATABASE || 'crib_society_db';

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✅ Connected to MySQL server (${dbConfig.host || 'via URL'}).`);

    const sqlFilePath = fs.existsSync(path.resolve(__dirname, '../../database/crib_society_db.sql'))
      ? path.resolve(__dirname, '../../database/crib_society_db.sql')
      : path.resolve(__dirname, '../../database/database.sql');

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`Migration SQL file not found at: ${sqlFilePath}`);
    }

    let sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    // Adapt database name dynamically if Railway uses a different database (e.g. 'railway')
    if (targetDb !== 'crib_society_db') {
      console.log(`ℹ️ Adapting database name from "crib_society_db" to "${targetDb}"...`);
      sqlContent = sqlContent.replace(/`crib_society_db`/g, `\`${targetDb}\``);
    }

    console.log(`📄 Executing ${path.basename(sqlFilePath)}...`);
    await connection.query(sqlContent);
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
