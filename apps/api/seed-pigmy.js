const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schemes = await prisma.pigmyScheme.findMany();
  if (schemes.length === 0) {
    console.log('Seeding default Pigmy scheme...');
    await prisma.pigmyScheme.create({
      data: {
        name: 'Standard Daily Savings',
        type: 'DAILY',
        minAmount: 100,
        maxAmount: 1000,
        interestRate: 3.5,
        interestPeriod: 6,
        maturityPeriod: 12,
        isActive: true,
      }
    });
    console.log('Default scheme created.');
  } else {
    console.log('Schemes already exist:', schemes.length);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
