import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const expenses = await prisma.officeExpense.findMany();
  console.log("All Office Expenses in Database:");
  console.log(JSON.stringify(expenses, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
