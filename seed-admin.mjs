import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:Srs-Society%40123@db.ptddphtsadqrdnhvenbg.supabase.co:5432/postgres?schema=admin',
      },
    },
  });

  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sharanam.local';
  const passwordHash = await bcrypt.hash(password, 10);

  const res = await prisma.adminUser.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      fullName: 'Portal Administrator',
      status: 'ACTIVE',
    },
    update: {
      passwordHash,
      status: 'ACTIVE',
    },
  });

  console.log('PORTAL ADMIN SEEDED SUCCESSFULLY:', res);
  await prisma.$disconnect();
}

main().catch(console.error);
