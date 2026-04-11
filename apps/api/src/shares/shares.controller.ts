import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('shares')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shares')
export class SharesController {
  constructor(private readonly sharesService: SharesService) {}

  @Get('me')
  list(@Req() req: any) {
    return this.sharesService.list(req.user.userId);
  }

  @Post('purchase')
  purchase(@Req() req: any, @Body('units') units: number, @Body('accountId') accountId: string) {
    return this.sharesService.purchase(req.user.userId, units, accountId);
  }
}
