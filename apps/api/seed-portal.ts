import * as bcrypt from 'bcryptjs';
import { PrismaClient as AdminClient } from '@credtrust/prisma-admin';

async function main() {
  const adminDb = new AdminClient();
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@sharanam.local';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';

  const passwordHash = await bcrypt.hash(password, 10);
  await adminDb.adminUser.upsert({
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

  console.log(`Portal admin ready: ${email} / ${password}`);
  console.log(`Use ADMIN_ACCESS_KEY (or ADMIN_SIGNUP_SECRET) as adminKey at login.`);
  await adminDb.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
