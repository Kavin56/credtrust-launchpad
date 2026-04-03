import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get('me')
  list(@Req() req: any) {
    return this.accountsService.list(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body('type') type: string) {
    return this.accountsService.create(req.user.userId, type);
  }
}
