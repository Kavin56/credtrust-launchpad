import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  trialBalance() {
    return this.reportsService.trialBalance();
  }

  @Get('cash-book')
  cashBook() {
    return this.reportsService.cashBook();
  }

  @Get('emi-due')
  emiDue(@Req() req: any) {
    return this.reportsService.emiDue(req.user.userId);
  }

  @Get('trial-balance/pdf')
  async trialBalancePdf(@Req() res: any) {
    const buffer = await this.reportsService.trialBalancePdf();
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="trial-balance.pdf"');
    res.send(buffer);
  }

  @Get('trial-balance/excel')
  async trialBalanceExcel(@Req() res: any) {
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
