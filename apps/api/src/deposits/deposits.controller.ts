import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { PayRdInstallmentDto } from './dto/pay-rd-installment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  list(@Req() req: any) {
    return this.depositsService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateDepositDto) {
    return this.depositsService.create(req.user.userId, dto);
  }

  @Post('pay-installment')
  payInstallment(@Req() req: any, @Body() dto: PayRdInstallmentDto) {
    return this.depositsService.payRdInstallment(req.user.userId, dto);
  }
}
