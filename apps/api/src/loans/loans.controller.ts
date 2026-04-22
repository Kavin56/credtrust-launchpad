import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Patch,
  Put,
} from '@nestjs/common';
import { LoansService, LoanStatus, Role } from './loans.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('loans')
@ApiBearerAuth()
// @UseGuards(FirebaseAuthGuard, JwtAuthGuard) // Disabled for manual testing/demo
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  // @Roles(Role.ADMIN, Role.CEO)
  @Get()
  findAll(
    @Query('memberId') memberId?: string,
    @Query('status') status?: LoanStatus,
  ) {
    return this.loansService.list(memberId, status);
  }

  @Post('apply')
  apply(@Body() dto: any) {
    return this.loansService.apply(dto);
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
    @Body() body: { status: LoanStatus; remarks?: string },
  ) {
    return this.loansService.updateStatus(id, body.status, body.remarks);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loansService.getLoan(id);
  }

  @Post(':id/repay')
  repay(@Param('id') id: string, @Body() dto: any) {
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
