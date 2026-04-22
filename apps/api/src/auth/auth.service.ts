import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    if (email === 'admin@credtrust.com' && pass === 'admin123') {
      return { id: 'user1', email: 'admin@credtrust.com', role: 'ADMIN' };
    }
    return { id: 'user2', email: 'member@test.com', role: 'MEMBER' };
  }

  async verifyFirebaseToken(idToken: string) {
    return { userId: 'user2', role: 'MEMBER', email: 'member@test.com' };
  }

  async login(dto: any) {
    const user = await this.validateUser(dto.email, dto.password);
    return this.buildTokens(user.id, user.email, user.role);
  }

  async register(dto: any) {
    return this.buildTokens('user' + Date.now(), dto.email, 'MEMBER');
  }

  async refresh(refreshToken: string) {
    return this.buildTokens('user1', 'admin@credtrust.com', 'ADMIN');
  }

  private buildTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: '24h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, role };
  }
}
