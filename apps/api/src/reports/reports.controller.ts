import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { ReportsService, PaymentHistoryQueryDto } from './reports.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  trialBalance() {
    return this.reportsService.trialBalance();
  }

  @Get('cash-book')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  cashBook() {
    return this.reportsService.cashBook();
  }

  @Get('emi-due')
  emiDue(@Req() req: any) {
    return this.reportsService.emiDue(req.user?.userId);
  }

  @Get('trial-balance/pdf')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  async trialBalancePdf(@Res() res: any) {
    const buffer = await this.reportsService.trialBalancePdf();
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'attachment; filename="trial-balance.pdf"');
    res.send(buffer);
  }

  @Get('trial-balance/excel')
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  async trialBalanceExcel(@Res() res: any) {
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

  // --- PAYMENT HISTORY ENDPOINTS ---

  @Get('payment-history')
  @Roles('ADMIN', 'CEO', 'DIRECTOR', 'TELLER', 'AGENT', 'MEMBER')
  @ApiOperation({ summary: 'Get payment history records & summary statistics with filtering' })
  async getPaymentHistory(
    @Query() query: PaymentHistoryQueryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    const role = req.user?.role || 'MEMBER';
    return this.reportsService.fetchPaymentHistoryData(query, userId, role);
  }

  @Get('payment-history/export')
  @Roles('ADMIN', 'CEO', 'DIRECTOR', 'TELLER', 'AGENT', 'MEMBER')
  @ApiOperation({ summary: 'Export payment history in PDF, Excel (XLSX), or CSV format' })
  async exportPaymentHistory(
    @Query() query: PaymentHistoryQueryDto & { format?: 'pdf' | 'excel' | 'csv' },
    @Req() req: any,
    @Res() res: any,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    const role = req.user?.role || 'MEMBER';
    const data = await this.reportsService.fetchPaymentHistoryData(query, userId, role);

    const format = (query.format || 'pdf').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];
    const filenamePrefix = role === 'MEMBER' ? 'My_Payment_History' : 'Payment_History_Report';

    if (format === 'excel' || format === 'xlsx') {
      const buffer = await this.reportsService.generatePaymentHistoryExcelBuffer(data);
      res.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.header(
        'Content-Disposition',
        `attachment; filename="${filenamePrefix}_${timestamp}.xlsx"`,
      );
      return res.send(buffer);
    }

    if (format === 'csv') {
      const csvStr = await this.reportsService.generatePaymentHistoryCsvString(data);
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.header(
        'Content-Disposition',
        `attachment; filename="${filenamePrefix}_${timestamp}.csv"`,
      );
      return res.send(csvStr);
    }

    // Default: PDF
    const buffer = await this.reportsService.generatePaymentHistoryPdfBuffer(data);
    res.header('Content-Type', 'application/pdf');
    res.header(
      'Content-Disposition',
      `attachment; filename="${filenamePrefix}_${timestamp}.pdf"`,
    );
    return res.send(buffer);
  }
}
