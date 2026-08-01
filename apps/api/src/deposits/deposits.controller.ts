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
import { DepositsService } from './deposits.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';

type UploadedDepositFile = {
  fieldname: string;
  filename: string;
  mimetype?: string;
  size: number;
  buffer: Buffer;
};

@ApiTags('deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deposits')
export class DepositsController {
  private readonly logger = new Logger(DepositsController.name);

  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  findAll(
    @Req() req: FastifyRequest,
    @Query('memberId') memberId?: string,
    @Query('status') status?: string,
  ) {
    const role = (req as any).user?.role;
    const userId = (req as any).user?.userId ?? (req as any).user?.sub;

    if (role === 'MEMBER') {
      return this.depositsService.listForMember(userId);
    }
    return this.depositsService.list(memberId, status);
  }

  @Post()
  async apply(@Req() req: FastifyRequest) {
    const startedAt = Date.now();
    const userId = (req as any).user?.userId ?? (req as any).user?.sub ?? 'unknown';
    const files: UploadedDepositFile[] = [];
    const fields: Record<string, any> = {};

    this.logger.log(`Deposit apply started user=${userId}`);

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

      const application = await this.depositsService.apply(userId, fields, files);
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

      this.logger.log(
        `Deposit apply completed user=${userId} app=${application.id} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt}`,
      );

      return application;
    } catch (error) {
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      const err = error as Error & { code?: string };

      this.logger.error(
        `Deposit apply failed user=${userId} files=${files.length} bytes=${totalBytes} durationMs=${Date.now() - startedAt} error=${err.message}`,
        err.stack,
      );

      throw error;
    }
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    const adminName = req.user?.email || 'Admin';
    return this.depositsService.updateStatus(id, 'APPROVED', 'Approved via manual action', adminName);
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string },
    @Req() req: any
  ) {
    const adminName = req.user?.email || 'Admin';
    return this.depositsService.updateStatus(id, body.status, body.remarks, adminName);
  }

  @Post(':id/transaction')
  @Roles('ADMIN', 'CEO')
  addTransaction(@Param('id') id: string, @Body() dto: any) {
    return this.depositsService.addTransaction(id, dto);
  }
}
