const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.pigmyScheme.findMany().then(console.log).finally(() => prisma.$disconnect());
