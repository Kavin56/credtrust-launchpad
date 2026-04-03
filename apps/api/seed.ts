import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@credtrust.local';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('Admin@1234', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: Role.ADMIN,
      },
    });
  }

  const ledgerAccounts = [
    { code: 'CASH', name: 'Cash on Hand', type: 'ASSET' },
    { code: 'BANK', name: 'Bank', type: 'ASSET' },
    { code: 'LOAN_INCOME', name: 'Loan Interest Income', type: 'INCOME' },
    { code: 'DEPOSIT_LIAB', name: 'Deposit Liability', type: 'LIABILITY' },
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
