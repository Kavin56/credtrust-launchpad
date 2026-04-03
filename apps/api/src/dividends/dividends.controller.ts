import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { DividendsService } from './dividends.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('dividends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dividends')
export class DividendsController {
  constructor(private readonly dividendsService: DividendsService) {}

  @Get()
  list() {
    return this.dividendsService.list();
  }

  @Post('declare')
  declare(@Body() body: any) {
    return this.dividendsService.declare(
      body.fiscalYear,
      Number(body.totalProfit),
      Number(body.payoutRate),
    );
  }
}
