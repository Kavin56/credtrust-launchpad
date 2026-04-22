import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(pass, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, role: user.role };
  }

  async verifyFirebaseToken(idToken: string) {
    // Firebase verification is not wired in this DB-backed flow.
    // If you want Firebase auth, we'll integrate firebase-admin and map users to DB records.
    return null;
  }

  async login(dto: any) {
    const user = await this.validateUser(dto.email, dto.password);
    return this.buildTokens(user.id, user.email, user.role);
  }

  async register(dto: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new UnauthorizedException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role || 'MEMBER',
      },
    });

    // Create a member profile for members.
    if (user.role === 'MEMBER') {
      const count = await this.prisma.member.count();
      const memberId = `MEM${(count + 1).toString().padStart(4, '0')}`;
      await this.prisma.member.create({
        data: {
          userId: user.id,
          memberId,
          fullName: dto.fullName,
          dob: new Date(dto.dob),
          contact: dto.contact,
          address: dto.address,
          aadhaarNumber: dto.aadhaarNumber,
          panNumber: dto.panNumber,
          nomineeName: dto.nomineeName,
          nomineeRelation: dto.nomineeRelation,
          nomineeAge: Number(dto.nomineeAge),
        },
      });
    }

    return this.buildTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const decoded: any = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
      return this.buildTokens(decoded.sub, decoded.email, decoded.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
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
