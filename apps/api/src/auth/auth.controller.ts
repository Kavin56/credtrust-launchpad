import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { JwtAuthGuard } from './jwt.guard';
import { FirebaseRegisterDto } from './dto/firebase-register.dto';
import { FirebaseAdminAccessDto } from './dto/firebase-admin-access.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('firebase/session')
  firebaseSession(@Req() req: any) {
    return this.authService.createFirebaseSessionFromToken(req.user);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('firebase/register')
  firebaseRegister(@Req() req: any, @Body() dto: FirebaseRegisterDto) {
    return this.authService.registerFirebaseUser(req.user, dto);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('firebase/admin-access')
  firebaseAdminAccess(@Req() req: any, @Body() dto: FirebaseAdminAccessDto) {
    return this.authService.grantFirebaseAdminAccess(req.user, dto.secretKey);
  }

  @UseGuards(JwtAuthGuard)
  @Post('status')
  async getStatus(@Req() req: any) {
    const member = await this.authService.checkMemberProfile(req.user.userId);
    return {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role,
      hasMemberProfile: !!member || req.user.role !== 'MEMBER',
    };
  }
}
