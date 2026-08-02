const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.member.findMany({
    select: { fullName: true, photoUrl: true, pendingPhotoUrl: true }
  });
  console.log(members);
}

main().catch(console.error).finally(() => prisma.$disconnect());
