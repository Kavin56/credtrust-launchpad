import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('trial-balance')
  trialBalance() {
    return this.reportsService.trialBalance();
  }

  @UseGuards(JwtAuthGuard)
  @Get('cash-book')
  cashBook() {
    return this.reportsService.cashBook();
  }

  @UseGuards(JwtAuthGuard)
  @Get('emi-due')
  emiDue(@Req() req: any) {
    return this.reportsService.emiDue(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rd-due')
  rdDue(@Req() req: any) {
    return this.reportsService.rdDue(req.user.userId);
  }

  @Get('trial-balance/pdf')
  async trialBalancePdf(@Res() res: FastifyReply) {
    const buffer = await this.reportsService.trialBalancePdf();
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="trial-balance.pdf"');
    res.send(buffer);
  }

  @Get('trial-balance/excel')
  async trialBalanceExcel(@Res() res: FastifyReply) {
    const buffer = await this.reportsService.trialBalanceExcel();
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.header(
      'Content-Disposition',
      'attachment; filename="trial-balance.xlsx"',
    );
    res.send(buffer);
  }
}
