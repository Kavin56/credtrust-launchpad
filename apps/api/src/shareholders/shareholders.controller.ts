import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('shareholders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shareholders')
export class ShareholdersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getShareholders(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('casteClass') casteClass?: string,
  ) {
    const where: any = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { memberName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { membershipReceiptNo: { contains: q, mode: 'insensitive' } },
        { relation: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (casteClass && casteClass !== 'ALL') {
      where.casteClass = casteClass;
    }

    const items = await this.prisma.shareholder.findMany({
      where,
      orderBy: { slNo: 'asc' },
    });

    return items;
  }

  @Get('stats')
  async getStats() {
    const [totalCount, agg] = await Promise.all([
      this.prisma.shareholder.count(),
      this.prisma.shareholder.aggregate({
        _sum: {
          noOfShares: true,
          totalShareAmount: true,
          grandTotal: true,
        },
      }),
    ]);

    return {
      totalShareholders: totalCount,
      totalShares: agg._sum.noOfShares || 0,
      totalShareCapital: agg._sum.totalShareAmount || 0,
      totalCollected: agg._sum.grandTotal || 0,
    };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const shareholder = await this.prisma.shareholder.findUnique({ where: { id } });
    if (!shareholder) return null;

    // Attempt to match or find member
    let member = await this.prisma.member.findFirst({
      where: {
        OR: [
          { id },
          { memberId: shareholder.membershipReceiptNo || '' },
          { contact: shareholder.phone || '' },
          { fullName: { equals: shareholder.memberName, mode: 'insensitive' } },
        ],
      },
      include: {
        loans: {
          include: {
            emiSchedule: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        depositAccounts: {
          orderBy: { createdAt: 'desc' },
        },
        pigmyAccounts: {
          include: {
            scheme: true,
            collections: {
              orderBy: { date: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Also fetch deposit applications for member if found
    let depositApplications: any[] = [];
    if (member) {
      depositApplications = await this.prisma.depositApplication.findMany({
        where: {
          memberId: member.id,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return {
      ...shareholder,
      member: member
        ? {
            ...member,
            depositApplications,
          }
        : null,
    };
  }

  @Post()
  async create(@Body() body: any) {
    const count = await this.prisma.shareholder.count();
    const slNo = body.slNo ? Number(body.slNo) : count + 1;
    const id = `sh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return this.prisma.shareholder.create({
      data: {
        id,
        slNo,
        memberName: body.memberName,
        relation: body.relation || null,
        address: body.address || null,
        phone: body.phone || null,
        age: body.age ? Number(body.age) : null,
        casteClass: body.casteClass || null,
        category: body.category || null,
        membershipReceiptNo: body.membershipReceiptNo || null,
        receiptDate: body.receiptDate || null,
        dateRemittedToDccBank: body.dateRemittedToDccBank || null,
        entranceFee: body.entranceFee ? Number(body.entranceFee) : 50,
        valueOfOneShare: body.valueOfOneShare ? Number(body.valueOfOneShare) : 500,
        noOfShares: body.noOfShares ? Number(body.noOfShares) : 1,
        totalShareAmount: body.totalShareAmount ? Number(body.totalShareAmount) : 500,
        shareFee: body.shareFee ? Number(body.shareFee) : 100,
        grandTotal: body.grandTotal ? Number(body.grandTotal) : 650,
        relationBasis: body.relationBasis || null,
      },
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.prisma.shareholder.update({
      where: { id },
      data: {
        memberName: body.memberName,
        relation: body.relation,
        address: body.address,
        phone: body.phone,
        age: body.age !== undefined && body.age !== '' ? Number(body.age) : null,
        casteClass: body.casteClass,
        category: body.category,
        membershipReceiptNo: body.membershipReceiptNo,
        receiptDate: body.receiptDate,
        dateRemittedToDccBank: body.dateRemittedToDccBank,
        entranceFee: body.entranceFee !== undefined ? Number(body.entranceFee) : undefined,
        valueOfOneShare: body.valueOfOneShare !== undefined ? Number(body.valueOfOneShare) : undefined,
        noOfShares: body.noOfShares !== undefined ? Number(body.noOfShares) : undefined,
        totalShareAmount: body.totalShareAmount !== undefined ? Number(body.totalShareAmount) : undefined,
        shareFee: body.shareFee !== undefined ? Number(body.shareFee) : undefined,
        grandTotal: body.grandTotal !== undefined ? Number(body.grandTotal) : undefined,
        relationBasis: body.relationBasis,
      },
    });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.prisma.shareholder.delete({ where: { id } });
  }
}
