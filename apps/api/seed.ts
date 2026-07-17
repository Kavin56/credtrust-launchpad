import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();
const encryptionKey = process.env.ENCRYPTION_KEY;
if (!encryptionKey || !/^[a-f0-9]{64}$/i.test(encryptionKey)) {
  throw new Error('ENCRYPTION_KEY must be a 64-character hex string before seeding.');
}
const key = Buffer.from(encryptionKey, 'hex');
const encrypt = (value: string) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `v1:${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${encrypted.toString('hex')}`;
};
const lookupHash = (value: string) => crypto.createHmac('sha256', key).update(value.trim().toUpperCase()).digest('hex');

async function main() {
  const adminEmail = 'admin@sharanam.local';
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
      memberId: 'SRN-SLM-0001',
      fullName: 'Suresh Kumar',
      dob: new Date('1990-01-01'),
      gender: 'Male',
      contact: '9876543210',
      address: '123 Main St, Salem',
      state: 'Tamil Nadu',
      district: 'Salem',
      pincode: '636001',
      aadhaarNumber: encrypt('123456789012'),
      aadhaarHash: lookupHash('123456789012'),
      panNumber: encrypt('ABCDE1234F'),
      panHash: lookupHash('ABCDE1234F'),
    }
  });

  // Create a normal MEMBER login for demo/testing
  const memberEmail = 'member@sharanam.local';
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
      memberId: 'SRN-SLM-0002',
      fullName: 'Priya Murugan',
      dob: new Date('1994-05-10'),
      gender: 'Female',
      contact: '9999999999',
      address: '456 Market Rd, Salem',
      state: 'Tamil Nadu',
      district: 'Salem',
      pincode: '636001',
      aadhaarNumber: encrypt('999988887777'),
      aadhaarHash: lookupHash('999988887777'),
      panNumber: encrypt('PQRSX1234Z'),
      panHash: lookupHash('PQRSX1234Z'),
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
