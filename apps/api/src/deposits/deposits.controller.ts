import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { DepositsService } from './deposits.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('deposits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Get()
  findAll(@Query('memberId') memberId?: string) {
    return this.depositsService.list(memberId);
  }

  @Post()
  create(@Body() dto: any, @Query('memberId') memberId?: string) {
    return this.depositsService.create(memberId, dto);
  }

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Body('amount') amount: number) {
    return this.depositsService.deposit(id, amount);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Body('amount') amount: number) {
    return this.depositsService.withdraw(id, amount);
  }
}
