import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initDb() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const schemaPath = path.join(__dirname, '../../sql/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await client.query(schema);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@university.ac.zm';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'System Admin';

  const existing = await client.query('SELECT id FROM users WHERE email = $1', [
    adminEmail.toLowerCase(),
  ]);

  if (existing.rows.length === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'admin')`,
      [adminEmail.toLowerCase(), passwordHash, adminName]
    );
    console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('Admin user already exists, skipped.');
  }

  await client.end();
  console.log('Database initialized successfully.');
}

initDb().catch((error) => {
  console.error('Database init failed:', error);
  process.exit(1);
});
