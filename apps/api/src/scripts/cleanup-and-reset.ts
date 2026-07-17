/**
 * One-time cleanup script:
 * 1. Delete all Member-related data from Supabase (in dependency order)
 * 2. Delete all Firebase Auth accounts
 *
 * Run from apps/api with: 
 *   $env:DATABASE_URL="..."; npx ts-node --project tsconfig.json -r tsconfig-paths/register src/scripts/cleanup-and-reset.ts
 */

import { PrismaClient } from '@prisma/client';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

async function run() {
  // ── 1. Init Firebase Admin ──────────────────────────────────────
  const keyPath = path.resolve(__dirname, '../../serviceAccountKey.json');
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  }
  const firebaseAuth = admin.auth();

  // ── 2. Delete all Firebase Auth users ──────────────────────────
  console.log('\n🔥 Deleting Firebase Auth users...');
  let pageToken: string | undefined;
  let totalDeleted = 0;
  do {
    const listResult = await firebaseAuth.listUsers(1000, pageToken);
    if (listResult.users.length > 0) {
      const uids = listResult.users.map((u) => u.uid);
      const deleteResult = await firebaseAuth.deleteUsers(uids);
      totalDeleted += deleteResult.successCount;
      console.log(`  Deleted ${deleteResult.successCount} Firebase users (${deleteResult.failureCount} failed)`);
    }
    pageToken = listResult.pageToken;
  } while (pageToken);
  console.log(`✅ Firebase Auth: ${totalDeleted} user(s) deleted`);

  // ── 3. Delete all Supabase DB records ──────────────────────────
  console.log('\n🗄️  Cleaning Supabase database...');
  const prisma = new PrismaClient();

  try {
    // Delete in dependency order (children first)
    const c1 = await prisma.pigmyCollection.deleteMany({});
    console.log(`  PigmyCollections deleted: ${c1.count}`);

    const c2 = await prisma.pigmyAccount.deleteMany({});
    console.log(`  PigmyAccounts deleted: ${c2.count}`);

    const c3 = await prisma.pigmyScheme.deleteMany({});
    console.log(`  PigmySchemes deleted: ${c3.count}`);

    const c4 = await prisma.emiSchedule.deleteMany({});
    console.log(`  EmiSchedules deleted: ${c4.count}`);

    const c5 = await prisma.loanRepayment.deleteMany({});
    console.log(`  LoanRepayments deleted: ${c5.count}`);

    const c6 = await prisma.loan.deleteMany({});
    console.log(`  Loans deleted: ${c6.count}`);

    const c7 = await prisma.depositTransaction.deleteMany({});
    console.log(`  DepositTransactions deleted: ${c7.count}`);

    const c8 = await prisma.depositAccount.deleteMany({});
    console.log(`  DepositAccounts deleted: ${c8.count}`);

    const c9 = await prisma.shareAccount.deleteMany({});
    console.log(`  ShareAccounts deleted: ${c9.count}`);

    const c10 = await prisma.ledgerEntry.deleteMany({});
    console.log(`  LedgerEntries deleted: ${c10.count}`);

    const c11 = await prisma.ledgerAccount.deleteMany({});
    console.log(`  LedgerAccounts deleted: ${c11.count}`);

    const c12 = await prisma.notification.deleteMany({});
    console.log(`  Notifications deleted: ${c12.count}`);

    const c13 = await prisma.auditLog.deleteMany({});
    console.log(`  AuditLogs deleted: ${c13.count}`);

    const c14 = await prisma.member.deleteMany({});
    console.log(`  Members deleted: ${c14.count}`);

    // Only delete MEMBER role users, preserve ADMIN/AGENT accounts
    const c15 = await prisma.user.deleteMany({ where: { role: 'MEMBER' } });
    console.log(`  Users (MEMBER role) deleted: ${c15.count}`);

    console.log('\n✅ Supabase database cleaned.');
  } finally {
    await prisma.$disconnect();
  }
}

run().catch((e) => {
  console.error('❌ Cleanup failed:', e);
  process.exit(1);
});
