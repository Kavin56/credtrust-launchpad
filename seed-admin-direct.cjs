const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres:Srs-Society%40123@db.ptddphtsadqrdnhvenbg.supabase.co:5432/postgres',
  });

  await client.connect();
  console.log('Connected to Supabase PostgreSQL database...');

  // Ensure admin schema exists
  await client.query(`CREATE SCHEMA IF NOT EXISTS admin;`);

  // Ensure AdminUser table exists in admin schema
  await client.query(`
    CREATE TABLE IF NOT EXISTS admin."AdminUser" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "fullName" TEXT,
      "status" TEXT DEFAULT 'ACTIVE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "lastLoginAt" TIMESTAMP(3)
    );
  `);

  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  const email = 'admin@sharanam.local';

  await client.query(`
    INSERT INTO admin."AdminUser" ("id", "email", "passwordHash", "fullName", "status", "updatedAt")
    VALUES ('cuid_admin_default', $1, $2, 'Portal Administrator', 'ACTIVE', NOW())
    ON CONFLICT ("email") DO UPDATE
    SET "passwordHash" = EXCLUDED."passwordHash",
        "status" = 'ACTIVE',
        "updatedAt" = NOW();
  `, [email, passwordHash]);

  await client.query(`
    INSERT INTO public."User" ("id", "email", "passwordHash", "role", "updatedAt")
    VALUES ('cuid_admin_user_default', $1, $2, 'ADMIN', NOW())
    ON CONFLICT ("email") DO UPDATE SET "passwordHash" = $2, "role" = 'ADMIN', "updatedAt" = NOW();
  `, [email, passwordHash]);

  console.log('🎉 PORTAL ADMIN SEEDED SUCCESSFULLY IN ALL SCHEMAS: admin@sharanam.local / Admin@1234');
  await client.end();
}

main().catch(console.error);
