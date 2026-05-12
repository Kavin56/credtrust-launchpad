import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Pigmy data...');

  // 1. Create a Collection Agent user
  const agentEmail = 'agent@sharanam.local';
  let agentUser = await prisma.user.findUnique({ where: { email: agentEmail } });
  if (!agentUser) {
    const passwordHash = await bcrypt.hash('Agent@1234', 10);
    agentUser = await prisma.user.create({
      data: {
        email: agentEmail,
        passwordHash,
        role: 'AGENT',
      },
    });
    console.log('Created Agent user');
  }

  // 2. Create a Pigmy Scheme
  const scheme = await prisma.pigmyScheme.upsert({
    where: { id: 'daily-gold-pigmy' },
    update: {},
    create: {
      id: 'daily-gold-pigmy',
      name: 'Daily Gold Pigmy',
      type: 'DAILY',
      minAmount: 100,
      maxAmount: 10000,
      interestRate: 3.0,
      interestPeriod: 6,
      maturityPeriod: 12,
      isActive: true,
    },
  });
  console.log('Created Pigmy Scheme');

  // 3. Create Pigmy Account for existing Member (MEM0002)
  const member = await prisma.member.findUnique({ where: { memberId: 'MEM0002' } });
  if (member) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1); // Started 1 month ago
    const maturityDate = new Date(startDate);
    maturityDate.setMonth(maturityDate.getMonth() + 12);

    const pigmyAccount = await prisma.pigmyAccount.upsert({
      where: { accountNumber: 'PIGMY0001' },
      update: {},
      create: {
        accountNumber: 'PIGMY0001',
        memberId: member.id,
        schemeId: scheme.id,
        agentId: agentUser.id,
        startDate: startDate,
        maturityDate: maturityDate,
        status: 'ACTIVE',
        balance: 3000,
        totalPaidDays: 30,
      },
    });
    console.log('Created Pigmy Account PIGMY0001');

    // 4. Add some collections
    const collectionsCount = await prisma.pigmyCollection.count({
      where: { accountId: pigmyAccount.id }
    });

    if (collectionsCount === 0) {
      for (let i = 0; i < 30; i++) {
        const collectionDate = new Date(startDate);
        collectionDate.setDate(collectionDate.getDate() + i);
        await prisma.pigmyCollection.create({
          data: {
            accountId: pigmyAccount.id,
            amount: 100,
            date: collectionDate,
            method: 'CASH',
            agentId: agentUser.id,
            receiptNumber: `RCPT${1000 + i}`,
            remarks: 'Daily collection',
          }
        });
      }
      console.log('Added 30 daily collections');
    }
  }

  console.log('Pigmy seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
