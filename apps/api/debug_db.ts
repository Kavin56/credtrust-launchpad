import { PrismaClient as MainPrisma } from '@prisma/client';
import { PrismaClient as AgentPrisma } from '@credtrust/prisma-agent';

async function main() {
  const prisma = new MainPrisma();
  const agentPrisma = new AgentPrisma();

  try {
    const agents = await agentPrisma.agent.findMany();
    console.log('--- AGENTS ---');
    console.log(JSON.stringify(agents, null, 2));

    const collections = await prisma.pigmyCollection.findMany({
      include: {
        account: true,
      }
    });
    console.log('--- COLLECTIONS ---');
    console.log(JSON.stringify(collections, null, 2));
  } catch (err) {
    console.error('Error running query:', err);
  } finally {
    await prisma.$disconnect();
    await agentPrisma.$disconnect();
  }
}

main();
