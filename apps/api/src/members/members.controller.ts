import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  Body,
  Post,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('members')
@ApiBearerAuth()
// Prefer Firebase token if provided; fallback to internal JWT
@UseGuards(FirebaseAuthGuard, JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('me')
  getMe(@Req() req: any) {
    return this.membersService.getProfile(req.user.userId);
  }

  @Get('me/overview')
  overview(@Req() req: any) {
    return this.membersService.dashboardOverview(req.user.userId);
  }

  @Patch(':memberId/kyc')
  updateKyc(@Param('memberId') memberId: string, @Body() dto: UpdateKycDto) {
    return this.membersService.updateKyc(memberId, dto);
  }

  @Post('me/kyc/upload')
  async uploadKyc(@Req() req: any) {
    const file = await req.file();
    return this.membersService.uploadKyc(req.user.userId, file);
  }

  @Patch('me/kyc')
  updateMyKyc(@Req() req: any, @Body() dto: UpdateKycDto) {
    return this.membersService.updateKycByUser(req.user.userId, dto);
  }
}
