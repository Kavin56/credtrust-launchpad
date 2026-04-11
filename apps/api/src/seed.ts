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
      balance: 1000000,
      status: 'ACTIVE',
      createdAt: new Date(),
    },
  })

  // Seed Ledger Accounts if they don't exist
  const ledgerAccountsToSeed = [
    { code: 'LOAN_PRINCIPAL', name: 'Loan Principal', type: 'ASSET' },
    { code: 'DEPOSIT_LIAB', name: 'Deposit Liability', type: 'LIABILITY' },
    { code: 'COLLATERAL_ASSET', name: 'Collateral Asset', type: 'ASSET' },
    { code: 'COLLATERAL_PLEDGED_LIABILITY', name: 'Collateral Pledged Liability', type: 'LIABILITY' },
    { code: 'LOAN_INCOME', name: 'Loan Interest Income', type: 'REVENUE' },
    { code: 'RETAINED_EARNINGS', name: 'Retained Earnings', type: 'EQUITY' },
  ]

  for (const accountData of ledgerAccountsToSeed) {
    await prisma.ledgerAccount.upsert({
      where: { code: accountData.code },
      update: {},
      create: accountData,
    })
  }

  console.log('Seed: created admin/user, member, savings account, and ledger accounts', { user, member, acc })
}

main()
  .catch((e) => {
    console.error('Seed failed', e)
  })
  .finally(async () => {
    const { exit } = require('node:process')
    exit(0)
  })
