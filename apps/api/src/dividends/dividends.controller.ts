import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { DividendsService } from './dividends.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('dividends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dividends')
export class DividendsController {
  constructor(private readonly dividendsService: DividendsService) {}

  @Get()
  findAll(@Query('memberId') memberId?: string) {
    return this.dividendsService.list();
  }

  @Post('declare')
  declare(@Body() body: any) {
    return this.dividendsService.declare(body);
  }
}
