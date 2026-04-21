import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  Body,
  Post,
  Query,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UpdateKycDto } from './dto/update-kyc.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { MemberQueryDto } from './dto/member-query.dto';

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard, JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles(Role.ADMIN, Role.CEO)
  @Get()
  findAll(@Query() query: MemberQueryDto) {
    return this.membersService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.CEO)
  @Get('stats')
  getStats() {
    return this.membersService.getStats();
  }

  @Get('me')
  getMe(@Req() req: any) {
    return this.membersService.getProfile(req.user.userId);
  }

  @Get('me/overview')
  overview(@Req() req: any) {
    return this.membersService.dashboardOverview(req.user.userId);
  }

  @Roles(Role.ADMIN, Role.TELLER)
  @Patch(':memberId/kyc')
  updateKyc(@Param('memberId') memberId: string, @Body() dto: UpdateKycDto) {
    return this.membersService.updateKyc(memberId, dto);
  }

  @Post('me/photo')
  async uploadPhoto(@Req() req: any) {
    const file = await req.file();
    return this.membersService.uploadPhoto(req.user.userId, file);
  }

  @Get(':userId')
  @Roles(Role.ADMIN, Role.CEO)
  getMember(@Param('userId') userId: string) {
    return this.membersService.getProfile(userId, true);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.deactivate(id, reason);
  }
}
