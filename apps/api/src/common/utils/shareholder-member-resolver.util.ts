import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from './encryption.util';
import * as bcrypt from 'bcryptjs';

/**
 * Ensures a valid Member record exists for a given targetId (which could be
 * a Member.id, Member.userId, Member.memberId, or a Shareholder.id like 'sh_2').
 * 
 * If targetId belongs to a Shareholder and no linked Member exists yet,
 * an active shadow Member and User are automatically provisioned so that
 * foreign-key constraints on Pigmy, Loan, and Deposit tables are satisfied.
 */
export async function resolveOrCreateMember(
  prisma: PrismaService,
  encryption: EncryptionService,
  targetId: string,
) {
  if (!targetId) return null;

  // 1. Direct search in Member table
  let member = await prisma.member.findFirst({
    where: {
      OR: [
        { id: targetId },
        { userId: targetId },
        { memberId: targetId },
        { rojaId: targetId },
      ],
    },
    include: { user: true },
  });

  if (member) return member;

  // 2. Check if targetId is a Shareholder id or if a Shareholder matches this id
  const shareholder = await prisma.shareholder.findFirst({
    where: {
      OR: [
        { id: targetId },
        { membershipReceiptNo: targetId },
      ],
    },
  });

  if (!shareholder) {
    return null;
  }

  // Check if a Member already exists matching this Shareholder (by phone, receiptNo, or name)
  member = await prisma.member.findFirst({
    where: {
      OR: [
        shareholder.membershipReceiptNo ? { memberId: `SHR-${shareholder.membershipReceiptNo}` } : undefined,
        shareholder.phone ? { contact: shareholder.phone } : undefined,
        shareholder.memberName ? { fullName: { equals: shareholder.memberName, mode: 'insensitive' } } : undefined,
      ].filter(Boolean) as any,
    },
    include: { user: true },
  });

  if (member) return member;

  // 3. Auto-provision a linked shadow User & Member for this Shareholder
  const sanitizedSl = shareholder.slNo ? shareholder.slNo.toString().padStart(4, '0') : Date.now().toString().slice(-4);
  const email = `shareholder_${shareholder.id.toLowerCase().replace(/[^a-z0-9]/g, '')}_${sanitizedSl}@sharanam.local`;
  
  // Check if shadow user already exists
  let existingUser = await prisma.user.findUnique({
    where: { email },
    include: { member: true },
  });

  if (existingUser?.member) {
    return existingUser.member;
  }

  let finalUserId = existingUser?.id;
  if (!finalUserId) {
    const passwordHash = await bcrypt.hash('Shareholder@123', 10);
    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'MEMBER',
        status: 'ACTIVE',
      },
    });
    finalUserId = createdUser.id;
  }

  const cleanPhone = (shareholder.phone || '9999999999').split('/')[0].replace(/[^0-9]/g, '').slice(-10) || '9999999999';
  const memberCode = `SRN-SH-${sanitizedSl}`;
  const dummyAadhaar = `SH${shareholder.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().padStart(10, '0')}`.slice(-12);
  const dummyPan = `SHARN${sanitizedSl}X`.toUpperCase().slice(0, 10);

  const newMember = await prisma.member.create({
    data: {
      userId: finalUserId,
      memberId: memberCode,
      rojaId: `ROJA-${memberCode}`,
      fullName: shareholder.memberName,
      dob: shareholder.age ? new Date(new Date().getFullYear() - shareholder.age, 0, 1) : new Date(1980, 0, 1),
      gender: 'Other',
      contact: cleanPhone,
      address: shareholder.address || 'Shivamogga, Karnataka',
      state: 'Karnataka',
      district: 'Shivamogga',
      pincode: '577201',
      country: 'India',
      aadhaarNumber: encryption.encrypt(dummyAadhaar),
      aadhaarHash: encryption.lookupHash(dummyAadhaar),
      panNumber: encryption.encrypt(dummyPan),
      panHash: encryption.lookupHash(dummyPan),
      kycStatus: 'VERIFIED',
      status: 'ACTIVE',
      seatBookingNumber: `SEAT-${sanitizedSl}`,
      membershipDate: new Date(),
    },
    include: { user: true },
  });

  return newMember;
}
