import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  // Simple idempotent seed: create an admin user and a member if none exist
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('Seed: users already exist, skipping seed')
    return
  }

  const user = await prisma.user.create({
    data: {
      email: 'admin@credtrust.local',
      passwordHash: 'seed',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  const member = await prisma.member.create({
    data: {
      userId: user.id,
      fullName: 'Seed Admin',
      dob: new Date('1980-01-01'),
      contact: '+10000000000',
      address: 'Seed Address',
      kycStatus: 'APPROVED',
      joinedOn: new Date(),
    },
  })

  const acc = await prisma.account.create({
    data: {
      memberId: member.id,
      type: 'SAVINGS',
      number: 'SA-0001',
      balance: 0,
      status: 'ACTIVE',
      createdAt: new Date(),
    },
  })

  console.log('Seed: created admin/user, member, and savings account', { user, member, acc })
}

main()
  .catch((e) => {
    console.error('Seed failed', e)
  })
  .finally(async () => {
    const { exit } = require('node:process')
    exit(0)
  })
