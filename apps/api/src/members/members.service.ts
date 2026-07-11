import { Injectable, NotFoundException, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async completeProfile(userId: string, data: any, files: any[]) {
    try {
      // 1. Check if member already exists
      let member = await this.prisma.member.findUnique({ where: { userId } });
      
      // 2. Generate Member ID if it doesn't exist
      if (!member) {
        const memberId = await this.generateMemberId(data.district);
        const seatBookingNumber = await this.generateUniqueId(userId);
        member = await this.prisma.member.create({
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
            aadhaarNumber: data.aadhaarNumber,
            panNumber: data.panNumber,
            seatBookingNumber,
          }
        });
      }

      // 3. Handle File Uploads
      const uploadDir = path.join(process.cwd(), 'uploads', 'signup');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePaths: any = {};
      for (const file of files) {
        const fileName = `${member.memberId}-${file.fieldname}-${Date.now()}${path.extname(file.filename)}`;
        const filePath = path.join(uploadDir, fileName);
        
        fs.writeFileSync(filePath, file.buffer);
        
        filePaths[file.fieldname] = `/uploads/signup/${fileName}`;
      }

      console.log(`Profile completed successfully for user ${userId}. Member ID: ${member.memberId}`);
      // 4. Update member with file paths
      return await this.prisma.member.update({
        where: { id: member.id },
        data: {
          aadhaarDocUrl: filePaths['aadhaarDoc'] || member.aadhaarDocUrl,
          panDocUrl: filePaths['panDoc'] || member.panDocUrl,
          kycStatus: 'PENDING',
        }
      });
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
    return { items, total, page, limit };
  }

  async getProfile(userId: string) {
    const member = await this.prisma.member.findFirst({
      where: { OR: [{ userId }, { id: userId }, { memberId: userId }] },
      include: { user: true, depositAccounts: true, loans: true, shareAccounts: true, pigmyAccounts: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    
    if (!member.seatBookingNumber) {
      const seatBookingNumber = await this.generateUniqueId(member.userId);
      return this.prisma.member.update({
        where: { id: member.id },
        data: { seatBookingNumber },
        include: { user: true, depositAccounts: true, loans: true, shareAccounts: true, pigmyAccounts: true },
      });
    }
    
    return member;
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

    return this.prisma.member.update({
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
      const uploadDir = path.join(process.cwd(), 'uploads', 'profile');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${userId}-profile-${Date.now()}${path.extname(file.filename)}`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = await file.toBuffer();
      await fs.promises.writeFile(filePath, buffer);

      const photoUrl = `/uploads/profile/${fileName}`;

      await this.prisma.member.update({
        where: { userId },
        data: { photoUrl },
      });

      return { photoUrl };
    } catch (error) {
      console.error('UPLOAD PHOTO ERROR:', error);
      throw new BadRequestException('Failed to upload profile picture.');
    }
  }
  
  async deactivate(id: string, reason: string) {
    await this.prisma.member.update({
      where: { id },
      data: { status: 'INACTIVE', exitReason: reason, deactivatedAt: new Date() },
    });
    return { success: true };
  }
}
