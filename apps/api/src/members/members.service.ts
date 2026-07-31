import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { StorageService } from '../storage/storage.service';
import { EncryptionService } from '../common/utils/encryption.util';

@Injectable()
export class MembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly storage: StorageService,
    private readonly encryption: EncryptionService,
  ) {}

  /**
   * Completes a member's registration.
   * IMPORTANT: Both aadhaarDoc and panDoc files are REQUIRED.
   * This is the ONLY place where a Member record is created.
   * The controller has already created the DB User before calling this.
   */
  async completeProfile(
    userId: string,
    data: any,
    files: any[],
    firebaseIdentity: { email: string; firebaseUid: string },
  ) {
    try {
      // 1. Reject if member already exists (prevent duplicate registrations)
      const existingMember = await this.prisma.member.findUnique({ where: { userId } });
      if (existingMember) {
        throw new BadRequestException(
          'A member profile already exists for this account. Please log in instead.',
        );
      }

      // 2. Validate required document fields
      const requiredFields = ['fullName', 'dob', 'gender', 'contact', 'address', 'state', 'district', 'pincode', 'aadhaarNumber', 'panNumber'];
      const missingFields = requiredFields.filter((f) => !data[f]);
      if (missingFields.length > 0) {
        throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // 3. Generate Member ID
      const memberId = await this.generateMemberId(data.district);
      const seatBookingNumber = await this.generateUniqueId(userId);

      // 4. Upload KYC documents
      const filePaths: any = {};
      for (const file of files) {
        filePaths[file.fieldname] = await this.storage.upload(
          file.buffer,
          `${memberId}-${file.fieldname}-${file.filename}`,
          file.mimetype || 'application/octet-stream',
          'kyc',
        );
      }

      // 5. Create member record (atomically - only after docs are saved)
      const member = await this.prisma.member.create({
        data: {
          userId,
          memberId,
          fullName: data.fullName,
          dob: new Date(data.dob),
          gender: data.gender || 'Other',
          contact: data.contact,
          address: data.address,
          state: data.state,
          district: data.district,
          pincode: data.pincode,
          aadhaarNumber: this.encryption.encrypt(data.aadhaarNumber),
          aadhaarHash: this.encryption.lookupHash(data.aadhaarNumber),
          panNumber: this.encryption.encrypt(data.panNumber),
          panHash: this.encryption.lookupHash(data.panNumber),
          seatBookingNumber,
          aadhaarDocUrl: filePaths['aadhaarDoc'],
          panDocUrl: filePaths['panDoc'],
          kycStatus: 'PENDING',
        },
      });

      console.log(`✅ Registration complete for user ${userId}. Member ID: ${member.memberId}`);

      // 6. Issue JWT tokens so the client is immediately authenticated
      const secret = process.env.JWT_SECRET;
      const refreshSecret = process.env.JWT_REFRESH_SECRET;
      if (!secret || !refreshSecret) throw new Error('JWT secrets not configured.');

      const payload = { sub: userId, email: firebaseIdentity.email, role: 'MEMBER' };
      const accessToken = this.jwtService.sign(payload, { secret, expiresIn: '24h' });
      const refreshToken = this.jwtService.sign(payload, { secret: refreshSecret, expiresIn: '7d' });

      return {
        accessToken,
        refreshToken,
        role: 'MEMBER',
        userId,
        email: firebaseIdentity.email,
        memberId: member.memberId,
        hasMemberProfile: true,
        message: 'Registration complete! Welcome to Saranam.',
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        const fields = error.meta?.target || [];
        throw new BadRequestException(`The ${fields.join(', ')} is already registered to another account.`);
      }
      throw error;
    }
  }

  private async generateMemberId(district: string) {
    const districtCode = this.getDistrictCode(district);
    const prefix = `SRN-${districtCode}`;
    
    const lastMember = await this.prisma.member.findFirst({
      where: { memberId: { startsWith: prefix } },
      orderBy: { memberId: 'desc' },
    });

    let nextNumber = 1;
    if (lastMember) {
      const parts = lastMember.memberId.split('-');
      const lastNum = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }

  private getDistrictCode(district: string): string {
    const mapping: Record<string, string> = {
      'Chennai': 'CHN',
      'Tiruvallur': 'TRL',
      'Kancheepuram': 'KPM',
      'Chengalpattu': 'CPT',
      'Coimbatore': 'CBE',
      'Madurai': 'MDU',
      'Trichy': 'TRY',
      'Salem': 'SLM',
    };
    return mapping[district] || (district ? district.substring(0, 3).toUpperCase() : 'GEN');
  }

  async findAll(query: any) {
    const page = Number(query.page || 1);
    const limit = Math.min(Number(query.limit || 10), 50);
    const skip = (page - 1) * limit;
    const search = (query.search || '').toString().trim();
    const where: any = {};
    if (query.kycStatus) where.kycStatus = query.kycStatus;
    if (query.status) where.status = query.status;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { memberId: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.member.findMany({
        where,
        skip,
        take: limit,
        orderBy: { joinedAt: 'desc' },
        include: { user: true },
      }),
      this.prisma.member.count({ where }),
    ]);
    const signedItems = await Promise.all(items.map(item => this.withSignedUrls(item)));
    return { items: signedItems, total, page, limit };
  }

  async getProfile(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
      include: { user: true, depositAccounts: true, loans: true, shareAccounts: true, pigmyAccounts: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    
    if (!member.seatBookingNumber) {
      const seatBookingNumber = await this.generateUniqueId(member.userId);
      const updated = await this.prisma.member.update({
        where: { id: member.id },
        data: { seatBookingNumber },
        include: { user: true, depositAccounts: true, loans: true, shareAccounts: true, pigmyAccounts: true },
      });
      return this.withSignedUrls(updated);
    }
    
    return this.withSignedUrls(member);
  }

  private async generateUniqueId(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.email === 'jayanthragavanmylsamy@gmail.com' || user?.email === 'jayanthragavnmylsamy@gmail.com') {
      return 'S-1001';
    }

    const members = await this.prisma.member.findMany({
      where: {
        seatBookingNumber: {
          startsWith: 'S-',
        },
      },
      select: {
        seatBookingNumber: true,
      },
    });

    let maxNum = 1001;
    for (const m of members) {
      if (m.seatBookingNumber) {
        const parts = m.seatBookingNumber.split('-');
        const num = parseInt(parts[parts.length - 1]);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    return `S-${maxNum + 1}`;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) throw new NotFoundException('Member not found');

    if (member.kycStatus === 'VERIFIED') {
      const changes: any = {};
      if (dto.fullName && dto.fullName !== member.fullName) changes.fullName = dto.fullName;
      if (dto.contact && dto.contact !== member.contact) changes.contact = dto.contact;
      if (dto.address && dto.address !== member.address) changes.address = dto.address;
      if (dto.dob && new Date(dto.dob).getTime() !== new Date(member.dob).getTime()) changes.dob = new Date(dto.dob);
      if (dto.gender && dto.gender !== member.gender) changes.gender = dto.gender;
      if (dto.bloodGroup && dto.bloodGroup !== member.bloodGroup) changes.bloodGroup = dto.bloodGroup;
      if (dto.emergencyContact && dto.emergencyContact !== member.emergencyContact) changes.emergencyContact = dto.emergencyContact;

      if (Object.keys(changes).length > 0) {
        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            pendingProfileChanges: JSON.stringify(changes)
          }
        });

        await this.prisma.notification.create({
          data: {
            title: 'Profile Update Requested',
            message: `A profile update request has been submitted for approval.`,
            type: 'APP'
          }
        });
      }
      return this.withSignedUrls(member);
    }

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        fullName: dto.fullName ?? member.fullName,
        contact: dto.contact ?? member.contact,
        address: dto.address ?? member.address,
        course: dto.course ?? member.course,
        seatBookingNumber: member.seatBookingNumber || dto.seatBookingNumber,
        dob: dto.dob ? new Date(dto.dob) : member.dob,
        designation: dto.designation ?? member.designation,
        department: dto.department ?? member.department,
        gender: dto.gender ?? member.gender,
        bloodGroup: dto.bloodGroup ?? member.bloodGroup,
        emergencyContact: dto.emergencyContact ?? member.emergencyContact,
      },
      include: { user: true, depositAccounts: true, loans: true, shareAccounts: true },
    });
    return this.withSignedUrls(updated);
  }

  async dashboardOverview(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
      include: { 
        depositAccounts: true, 
        loans: {
          include: { emiSchedule: true }
        }, 
        shareAccounts: true,
        pigmyAccounts: true
      },
    });
    if (!member) throw new NotFoundException('Member not found');

    const totalBalance = (member.depositAccounts || []).reduce(
      (sum, a: any) => sum + Number(a.balance || 0),
      0,
    );
    const sharesOwned = (member.shareAccounts || []).reduce(
      (sum, s: any) => sum + Number(s.sharesOwned || 0),
      0,
    );
    
    // Find the next upcoming EMI across all active loans
    let nextEmi = null;
    const allPendingEmis = (member.loans || [])
      .filter((l: any) => ['ACTIVE', 'OVERDUE'].includes(String(l.status)))
      .flatMap((l: any) => (l.emiSchedule || []).filter((e: any) => !e.isPaid))
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (allPendingEmis.length > 0) {
      const earliest = allPendingEmis[0];
      nextEmi = {
        totalDue: earliest.totalEmi,
        dueDate: earliest.dueDate,
      };
    }

    return {
      name: member.fullName,
      kycStatus: member.kycStatus,
      totalBalance,
      sharesOwned,
      loans: member.loans || [],
      deposits: member.depositAccounts || [],
      nextEmi,
    };
  }

  async getStats() {
    const [total, active, pendingKyc] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.member.count({ where: { status: 'ACTIVE' } }),
      this.prisma.member.count({ where: { kycStatus: 'PENDING' } }),
    ]);
    return { total, active, pendingKyc };
  }
  
  async updateKyc(memberId: string, dto: any) {
    await this.prisma.member.update({
      where: { id: memberId },
      data: { kycStatus: dto.status },
    });
    return { success: true };
  }

  async uploadPhoto(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException('No image file uploaded.');
    }

    // Verify member exists first
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found.');
    }

    try {
      const buffer = await file.toBuffer();
      const photoUrl = await this.storage.upload(
        buffer,
        `${userId}-profile-${file.filename}`,
        file.mimetype || 'application/octet-stream',
        'profile',
      );

      const dataUpdate: any = {};
      if (member.kycStatus === 'VERIFIED') {
        dataUpdate.pendingPhotoUrl = photoUrl;

        await this.prisma.notification.create({
          data: {
            title: 'Profile Photo Uploaded',
            message: `User has uploaded a new profile photo pending approval.`,
            type: 'APP'
          }
        });
      } else {
        dataUpdate.photoUrl = photoUrl;
      }

      await this.prisma.member.update({
        where: { userId },
        data: dataUpdate,
      });

      return { photoUrl: await this.storage.signedUrl(photoUrl) };
    } catch (error) {
      console.error('UPLOAD PHOTO ERROR:', error);
      throw new BadRequestException('Failed to upload profile picture.');
    }
  }

  async uploadDocument(userId: string, docType: string, file: any) {
    if (!file) {
      throw new BadRequestException('No document file uploaded.');
    }

    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found.');
    }

    try {
      const fileUrl = await this.storage.upload(
        file.buffer,
        `${member.memberId}-${docType}-${file.filename}`,
        file.mimetype || 'application/octet-stream',
        'kyc',
      );

      const updateData: any = {};
      if (docType === 'panDoc' || docType === 'pan') {
        updateData.panDocUrl = fileUrl;
      } else {
        updateData.aadhaarDocUrl = fileUrl;
      }

      await this.prisma.member.update({
        where: { id: member.id },
        data: updateData,
      });

      return { success: true, url: await this.storage.signedUrl(fileUrl) };
    } catch (error) {
      console.error('UPLOAD DOCUMENT ERROR:', error);
      throw new BadRequestException('Failed to upload document.');
    }
  }
  
  async deactivate(id: string, reason: string) {
    await this.prisma.member.update({
      where: { id },
      data: { status: 'INACTIVE', exitReason: reason, deactivatedAt: new Date() },
    });
    return { success: true };
  }

  private async withSignedUrls<T extends any>(member: T): Promise<T> {
    if (!member) return member;
    const updated = { ...member } as any;
    const fieldsToSign = [
      'photoUrl',
      'aadhaarDocUrl',
      'panDocUrl',
      'pendingPhotoUrl',
      'pendingSignatureUrl',
      'approvedSignatureUrl',
      'adminSignatureUrl',
      'officeSealUrl'
    ];
    for (const field of fieldsToSign) {
      if (updated[field] && (updated[field].startsWith('gs://') || updated[field].startsWith('/uploads/') || updated[field].startsWith('profile/') || updated[field].startsWith('signatures/') || updated[field].startsWith('office/'))) {
        try {
          updated[field] = await this.storage.signedUrl(updated[field]);
        } catch (e) {
          console.error(`Failed to sign URL for ${field}:`, e);
        }
      }
    }
    return updated;
  }

  async uploadSignature(userId: string, file: any) {
    if (!file) {
      throw new BadRequestException('No signature file uploaded.');
    }
    const member = await this.prisma.member.findUnique({
      where: { userId },
    });
    if (!member) {
      throw new NotFoundException('Member profile not found.');
    }

    const buffer = await file.toBuffer();
    const signatureUrl = await this.storage.upload(
      buffer,
      `${userId}-signature-${file.filename}`,
      file.mimetype || 'application/octet-stream',
      'signatures',
    );

    await this.prisma.member.update({
      where: { userId },
      data: { pendingSignatureUrl: signatureUrl },
    });

    await this.prisma.notification.create({
      data: {
        title: 'Signature Uploaded',
        message: `User has uploaded a digital signature pending approval.`,
        type: 'APP'
      }
    });

    return { signatureUrl: await this.storage.signedUrl(signatureUrl) };
  }

  async verifyRojaId(memberId: string, adminName: string, registeredId?: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const newMemberId = registeredId 
      ? (registeredId.toUpperCase().startsWith('ROJA-') ? registeredId.toUpperCase() : `ROJA-${registeredId}`)
      : member.memberId;

    const updatedMember = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        kycStatus: 'VERIFIED',
        membershipDate: member.membershipDate || new Date(),
        verificationDate: new Date(),
        verifiedBy: adminName,
        memberId: newMemberId,
      }
    });

    // Automatically update all PENDING_REGISTERED_ID_APPROVAL applications to PENDING
    await this.prisma.loan.updateMany({
      where: { memberId, status: 'PENDING_REGISTERED_ID_APPROVAL' },
      data: { status: 'PENDING' }
    });

    await this.prisma.depositApplication.updateMany({
      where: { memberId, status: 'PENDING_REGISTERED_ID_APPROVAL' },
      data: { status: 'PENDING' }
    });

    await this.prisma.pigmyAccount.updateMany({
      where: { memberId, status: 'PENDING_REGISTERED_ID_APPROVAL' },
      data: { status: 'PENDING' }
    });

    // Send notification to member
    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'Registered ID Approved',
        message: `Your Registered ID (ROJA ID) has been successfully verified!`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updatedMember) };
  }

  async applySealSignature(memberId: string, adminSignatureFile: any, officeSealFile: any) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const dataUpdate: any = { idCardStatus: 'GENERATED' };

    if (adminSignatureFile) {
      const buffer = adminSignatureFile.buffer;
      const adminSignatureUrl = await this.storage.upload(
        buffer,
        `admin-sig-${memberId}-${adminSignatureFile.filename}`,
        adminSignatureFile.mimetype || 'application/octet-stream',
        'office',
      );
      dataUpdate.adminSignatureUrl = adminSignatureUrl;
    }

    if (officeSealFile) {
      const buffer = officeSealFile.buffer;
      const officeSealUrl = await this.storage.upload(
        buffer,
        `office-seal-${memberId}-${officeSealFile.filename}`,
        officeSealFile.mimetype || 'application/octet-stream',
        'office',
      );
      dataUpdate.officeSealUrl = officeSealUrl;
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: dataUpdate
    });

    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'Digital ID Card Generated',
        message: `Your Digital Membership ID Card has been generated with official seal and signature.`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async approveProfileChanges(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const dataUpdate: any = {};
    if (member.pendingProfileChanges) {
      try {
        const changes = JSON.parse(member.pendingProfileChanges);
        Object.assign(dataUpdate, changes);
      } catch (e) {}
      dataUpdate.pendingProfileChanges = null;
    }

    if (member.pendingPhotoUrl) {
      dataUpdate.photoUrl = member.pendingPhotoUrl;
      dataUpdate.pendingPhotoUrl = null;
    }

    if (member.pendingSignatureUrl) {
      dataUpdate.approvedSignatureUrl = member.pendingSignatureUrl;
      dataUpdate.pendingSignatureUrl = null;
    }

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: dataUpdate
    });

    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'Profile Changes Approved',
        message: `Your requested profile changes have been approved.`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async rejectProfileChanges(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: {
        pendingProfileChanges: null,
        pendingPhotoUrl: null,
        pendingSignatureUrl: null,
      }
    });

    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'Profile Changes Rejected',
        message: `Your requested profile changes have been rejected.`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async requestCardDownload(userId: string) {
    const member = await this.prisma.member.findUnique({ where: { userId } });
    if (!member) throw new NotFoundException('Member not found');

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: { downloadRequestStatus: 'PENDING', downloadRequestRemarks: null }
    });

    await this.prisma.notification.create({
      data: {
        title: 'ID Card Download Requested',
        message: `Member ${member.fullName} has requested approval to download their ID Card.`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async approveCardDownload(memberId: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: { downloadRequestStatus: 'APPROVED' }
    });

    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'ID Card Download Approved',
        message: `Your download request has been approved! You can now download your Digital ID card.`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async rejectCardDownload(memberId: string, remarks: string) {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const updated = await this.prisma.member.update({
      where: { id: memberId },
      data: { downloadRequestStatus: 'REJECTED', downloadRequestRemarks: remarks }
    });

    await this.prisma.notification.create({
      data: {
        memberId: member.id,
        title: 'ID Card Download Rejected',
        message: `Your download request was rejected: ${remarks}`,
        type: 'APP'
      }
    });

    return { success: true, member: await this.withSignedUrls(updated) };
  }

  async validateRegisteredId(id: string) {
    const inputId = id.trim();
    if (!inputId) {
      return { valid: false, message: 'ID cannot be empty' };
    }

    // Check exact match, match with prepended prefix, or match by suffix
    let member = await this.prisma.member.findFirst({
      where: {
        OR: [
          { memberId: inputId },
          { memberId: `ROJA-${inputId}` },
          { memberId: { endsWith: `-${inputId}` } },
          { memberId: { endsWith: `-${inputId.padStart(4, '0')}` } }
        ]
      }
    });

    if (!member) {
      // General contains check
      member = await this.prisma.member.findFirst({
        where: {
          memberId: { contains: inputId, mode: 'insensitive' }
        }
      });
    }

    if (member) {
      // Format the ID to ROJA-<number> or ROJA-<id>
      let formattedId = member.memberId;
      const parts = member.memberId.split('-');
      const lastPart = parts[parts.length - 1];
      const parsedNum = parseInt(lastPart);
      if (!isNaN(parsedNum)) {
        formattedId = `ROJA-${lastPart}`;
      } else {
        formattedId = `ROJA-${member.memberId}`;
      }

      return {
        valid: true,
        memberId: member.memberId,
        fullName: member.fullName,
        formattedId,
        member
      };
    }

    return { valid: false, message: 'Invalid Registered ID' };
  }
}
