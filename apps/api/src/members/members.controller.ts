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

  @Post('complete-profile')
  async completeProfile(@Req() req: any) {
    const parts = req.parts();
    const data: any = {};
    const uploadedFiles: any[] = [];
    
    for await (const part of parts) {
      if (part.file) {
        // We must consume the stream immediately or it will hang
        // We'll store the stream and handle it in the service
        // Actually, to avoid issues, let's buffer the file or save to a temp location
        // But for now, let's just make sure we don't block the loop
        const buffer = await part.toBuffer();
        uploadedFiles.push({
          fieldname: part.fieldname,
          filename: part.filename,
          mimetype: part.mimetype,
          buffer: buffer
        });
      } else {
        data[part.fieldname] = part.value;
      }
    }
    
    return this.membersService.completeProfile(req.user.userId, data, uploadedFiles);
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
