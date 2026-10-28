import {
  Logger,
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { Roles, RolesGuard } from '../common/guards/roles.guard';

type UploadedLoanFile = {
  fieldname: string;
  filename: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  private readonly logger = new Logger(LoansController.name);

  constructor(private readonly loansService: LoansService) {}

  // @Roles(Role.ADMIN, Role.CEO)
  @Get('my')
  @Roles('MEMBER', 'ADMIN', 'CEO', 'DIRECTOR', 'TELLER')
  findMyLoans(@Req() req: FastifyRequest) {
    const userId = (req as any).user?.userId ?? (req as any).user?.sub;
    return this.loansService.listForMember(userId);
  }

  @Get()
  @Roles('ADMIN', 'CEO', 'DIRECTOR', 'TELLER', 'MEMBER')
  findAll(
    @Req() req: FastifyRequest,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
  ) {
    const role = (req as any).user?.role;
    const userId = (req as any).user?.userId ?? (req as any).user?.sub;
    if (role === 'MEMBER') {
      return this.loansService.listForMember(userId);
    }
    return this.loansService.list(memberId, status);
  }

  @Post('apply')
  @Roles('MEMBER', 'ADMIN', 'CEO')
  async apply(@Req() req: FastifyRequest) {
    const startedAt = Date.now();
    const callerRole = (req as any).user?.role;
    const callerUserId = (req as any).user?.userId ?? (req as any).user?.sub ?? 'unknown';
    const files: UploadedLoanFile[] = [];
    const fields: Record<string, any> = {};

    this.logger.log(`Loan apply started caller=${callerUserId} role=${callerRole}`);

    try {
      // Fastify multipart handling (files + fields)
      const parts = (req as any).parts();
      for await (const part of parts as AsyncIterable<any>) {
        if (part.file) {
          const buffer = await part.toBuffer();
          files.push({
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            size: buffer.length,
            buffer,
          });
        } else {
          fields[part.fieldname] = part.value;
        }
      }

      // If ADMIN or CEO and a target member/user was specified, use that target. Otherwise bind to caller.
      if (['ADMIN', 'CEO'].includes(callerRole) && (fields.targetUserId || fields.targetMemberId)) {
        fields.userId = fields.targetUserId || fields.targetMemberId;
        fields.isAdminCreation = true;
      } else {
        fields.userId = callerUserId;
      }
      const loan = await this.loansService.apply(fields, files);
      const totalBytes = files.reduce(
        (sum, file) => sum + file.size,
        0,
      );

      this.logger.log(
        `Loan apply completed user=${fields.userId} loan=${loan.id} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt}`,
      );

      return loan;
    } catch (error) {
      const totalBytes = files.reduce(
        (sum, file) => sum + file.size,
        0,
      );
      const err = error as Error & { code?: string };

      this.logger.error(
        `Loan apply failed user=${callerUserId} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt} code=${err.code || 'unknown'} error=${err.message}`,
        err.stack,
      );

      throw error;
    }
  }

  // @Roles(Role.ADMIN, Role.CEO)
  @Patch(':id/approve')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  approve(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  // @Roles(Role.ADMIN, Role.CEO)
  @Put(':id/status')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string },
  ) {
    return this.loansService.updateStatus(id, body.status, body.remarks);
  }

  @Get('check-eligibility')
  @Roles('MEMBER')
  checkEligibility(
    @Query('memberId') memberId: string,
    @Query('amount') amount: number,
  ) {
    return this.loansService.checkEligibility(memberId, Number(amount));
  }

  @Get(':id')
  @Roles('ADMIN', 'CEO', 'DIRECTOR', 'TELLER')
  findOne(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Post(':id/repay')
  @Roles('ADMIN', 'CEO', 'MEMBER')
  repay(@Param('id') id: string, @Body() dto: any, @Req() req: FastifyRequest) {
    const userId = (req as any).user?.userId ?? (req as any).user?.sub;
    const role = (req as any).user?.role;
    return this.loansService.repay(id, dto, userId, role);
  }

  @Post('pay')
  @Roles('ADMIN', 'CEO', 'MEMBER')
  pay(@Body() dto: { loanId: string; amount: number; paymentMethod: string; transactionId?: string }, @Req() req: FastifyRequest) {
    const userId = (req as any).user?.userId ?? (req as any).user?.sub;
    const role = (req as any).user?.role;
    const { loanId, ...repaymentData } = dto;
    return this.loansService.repay(loanId, repaymentData, userId, role);
  }
}
