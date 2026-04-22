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

type UploadedLoanFile = {
  fieldname: string;
  filename: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  private readonly logger = new Logger(LoansController.name);

  constructor(private readonly loansService: LoansService) {}

  // @Roles(Role.ADMIN, Role.CEO)
  @Get()
  findAll(
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
  ) {
    return this.loansService.list(memberId, status);
  }

  @Post('apply')
  async apply(@Req() req: FastifyRequest) {
    const startedAt = Date.now();
    const userId = (req as any).user?.userId ?? 'unknown';
    const files: UploadedLoanFile[] = [];
    const fields: Record<string, any> = {};

    this.logger.log(`Loan apply started user=${userId}`);

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

      // Always bind to the authenticated user.
      fields.userId = userId;
      const loan = await this.loansService.apply(fields, files);
      const totalBytes = files.reduce(
        (sum, file) => sum + file.size,
        0,
      );

      this.logger.log(
        `Loan apply completed user=${userId} loan=${loan.id} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt}`,
      );

      return loan;
    } catch (error) {
      const totalBytes = files.reduce(
        (sum, file) => sum + file.size,
        0,
      );
      const err = error as Error & { code?: string };

      this.logger.error(
        `Loan apply failed user=${userId} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt} code=${err.code || 'unknown'} error=${err.message}`,
        err.stack,
      );

      throw error;
    }
  }

  // @Roles(Role.ADMIN, Role.CEO)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  // @Roles(Role.ADMIN, Role.CEO)
  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string },
  ) {
    return this.loansService.updateStatus(id, body.status, body.remarks);
  }

  @Get('check-eligibility')
  checkEligibility(
    @Query('memberId') memberId: string,
    @Query('amount') amount: number,
  ) {
    return this.loansService.checkEligibility(memberId, Number(amount));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Post(':id/repay')
  repay(@Param('id') id: string, @Body() dto: any) {
    return this.loansService.repay(id, dto);
  }
}
