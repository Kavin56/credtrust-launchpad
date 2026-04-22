import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Body,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.membersService.findAll(query);
  }

  @Get('stats')
  getStats() {
    return this.membersService.getStats();
  }

  @Get('me')
  getMe(@Req() req: any) {
    return this.membersService.getProfile(req.user.userId);
  }

  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.membersService.updateProfile(req.user.userId, dto);
  }

  @Get('me/overview')
  overview(@Req() req: any) {
    return this.membersService.dashboardOverview(req.user.userId);
  }

  @Patch(':memberId/kyc')
  updateKyc(@Param('memberId') memberId: string, @Body() dto: any) {
    return this.membersService.updateKyc(memberId, dto);
  }

  @Post('me/photo')
  async uploadPhoto(@Req() req: any) {
    const file = await req.file();
    return this.membersService.uploadPhoto(req.user.userId, file);
  }

  @Get(':userId')
  getMember(@Param('userId') userId: string) {
    return this.membersService.getProfile(userId);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.deactivate(id, reason);
  }
}
