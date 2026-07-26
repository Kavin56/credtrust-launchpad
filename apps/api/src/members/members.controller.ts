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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { AuthService } from '../auth/auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Roles, RolesGuard } from '../common/guards/roles.guard';

@ApiTags('members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly authService: AuthService,
  ) {}

  @Get('validate-id/:id')
  @UseGuards(JwtAuthGuard)
  validateId(@Param('id') id: string) {
    return this.membersService.validateRegisteredId(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  findAll(@Query() query: any) {
    return this.membersService.findAll(query);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  getStats() {
    return this.membersService.getStats();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  getMe(@Req() req: any) {
    return this.membersService.getProfile(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  updateMe(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.membersService.updateProfile(req.user.userId, dto);
  }

  /**
   * Complete member registration with KYC documents.
   * Uses FirebaseAuthGuard so the client sends a raw Firebase ID token
   * (not a JWT). A DB User + Member record is only created here, AFTER
   * both KYC documents have been successfully uploaded.
   */
  @UseGuards(FirebaseAuthGuard)
  @Post('complete-profile')
  async completeProfile(@Req() req: any) {
    try {
      const firebaseIdentity = req.user; // set by FirebaseAuthGuard

      const parts = req.parts();
      const data: any = {};
      const uploadedFiles: any[] = [];

      for await (const part of parts) {
        if (part.type === 'file') {
          const buffer = await part.toBuffer();
          uploadedFiles.push({
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            buffer: buffer,
          });
        } else {
          data[part.fieldname] = part.value;
        }
      }

      // Enforce: both KYC documents MUST be present
      const hasAadhaar = uploadedFiles.some((f) => f.fieldname === 'aadhaarDoc');
      const hasPan = uploadedFiles.some((f) => f.fieldname === 'panDoc');
      if (!hasAadhaar || !hasPan) {
        throw new HttpException(
          'Both Aadhaar and PAN documents are required to complete registration.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Create DB user (if not already exists) then create member + upload docs
      const dbUser = await this.authService.createMemberUser(firebaseIdentity);
      return await this.membersService.completeProfile(dbUser.id, data, uploadedFiles, firebaseIdentity);
    } catch (error: any) {
      console.error('COMPLETE PROFILE ERROR:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  overview(@Req() req: any) {
    return this.membersService.dashboardOverview(req.user.userId);
  }

  @Patch(':memberId/kyc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  updateKyc(@Param('memberId') memberId: string, @Body() dto: any) {
    return this.membersService.updateKyc(memberId, dto);
  }

  @Post('me/photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  async uploadPhoto(@Req() req: any) {
    const file = await req.file();
    return this.membersService.uploadPhoto(req.user.userId, file);
  }

  @Post('me/document')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER')
  async uploadDocument(@Req() req: any) {
    const parts = req.parts();
    let docType = 'aadhaarDoc';
    let fileObj: any = null;

    for await (const part of parts) {
      if (part.type === 'file') {
        const buffer = await part.toBuffer();
        fileObj = {
          fieldname: part.fieldname,
          filename: part.filename,
          mimetype: part.mimetype,
          buffer,
        };
      } else {
        if (part.fieldname === 'docType') docType = part.value;
      }
    }

    return this.membersService.uploadDocument(req.user.userId, docType, fileObj);
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  getMember(@Param('userId') userId: string) {
    return this.membersService.getProfile(userId);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'CEO', 'DIRECTOR')
  deactivate(@Param('id') id: string, @Body('reason') reason: string) {
    return this.membersService.deactivate(id, reason);
  }
}
