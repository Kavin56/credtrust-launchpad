import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@credtrust.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  let adminUser = existing;
  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@1234', 10);
    adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
      },
    });
  }

  // Create a default member for the admin user
  await prisma.member.upsert({
    where: { userId: adminUser!.id },
    update: {},
    create: {
      userId: adminUser!.id,
      memberId: 'MEM0001',
      fullName: 'Suresh Kumar',
      dob: new Date('1990-01-01'),
      contact: '9876543210',
      address: '123 Main St, Salem',
      aadhaarNumber: '123456789012',
      panNumber: 'ABCDE1234F',
    }
  });

  // Create a normal MEMBER login for demo/testing
  const memberEmail = 'member@credtrust.local';
  const existingMemberUser = await prisma.user.findUnique({ where: { email: memberEmail } });
  const memberUser =
    existingMemberUser ||
    (await prisma.user.create({
      data: {
        email: memberEmail,
        passwordHash: await bcrypt.hash('Member@1234', 10),
        role: 'MEMBER',
      },
    }));

  await prisma.member.upsert({
    where: { userId: memberUser.id },
    update: {},
    create: {
      userId: memberUser.id,
      memberId: 'MEM0002',
      fullName: 'Priya Murugan',
      dob: new Date('1994-05-10'),
      contact: '9999999999',
      address: '456 Market Rd, Salem',
      aadhaarNumber: '999988887777',
      panNumber: 'PQRSX1234Z',
    },
  });

  const ledgerAccounts = [
    { code: 'CASH', name: 'Cash on Hand', type: 'ASSET', category: 'ASSET' },
    { code: 'BANK', name: 'Bank Account', type: 'ASSET', category: 'ASSET' },
    { code: 'LOAN_INCOME', name: 'Loan Interest Income', type: 'INCOME', category: 'INCOME' },
    { code: 'DEPOSIT_LIAB', name: 'Deposit Liability', type: 'LIABILITY', category: 'LIABILITY' },
  ];
  for (const acc of ledgerAccounts) {
    await prisma.ledgerAccount.upsert({
      where: { code: acc.code },
      update: acc,
      create: acc,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
