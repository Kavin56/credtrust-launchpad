import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { ApplyLoanDto } from './dto/apply-loan.dto';
import { LoanRepaymentDto } from './dto/repayment.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Roles(Role.ADMIN, Role.CEO)
  @Get()
  findAll(@Query('memberId') memberId?: string) {
    return this.loansService.list(memberId);
  }

  @Post('apply')
  apply(@Body() dto: ApplyLoanDto) {
    return this.loansService.apply(dto);
  }

  @Roles(Role.ADMIN, Role.CEO)
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.loansService.approveLoan(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Post(':id/repay')
  repay(@Param('id') id: string, @Body() dto: LoanRepaymentDto) {
    return this.loansService.repay(id, dto);
  }

  @Get('check-eligibility')
  checkEligibility(
    @Query('memberId') memberId: string,
    @Query('amount') amount: number,
  ) {
    return this.loansService.checkEligibility(memberId, Number(amount));
  }
}
