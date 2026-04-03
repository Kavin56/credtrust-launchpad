import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoansService } from './loans.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApplyLoanDto } from './dto/apply-loan.dto';
import { PayEmiDto } from './dto/pay-emi.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get()
  list(@Req() req: any) {
    return this.loansService.list(req.user.userId);
  }

  @Post()
  apply(@Req() req: any, @Body() dto: ApplyLoanDto) {
    return this.loansService.apply(req.user.userId, dto);
  }

  @Post('pay')
  pay(@Req() req: any, @Body() dto: PayEmiDto) {
    return this.loansService.payEmi(req.user.userId, dto);
  }
}
