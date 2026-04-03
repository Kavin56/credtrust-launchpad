import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private firebaseApp =
    admin.apps[0] ||
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const isValid = await bcrypt.compare(pass, user.passwordHash);
    return isValid ? user : null;
  }

  async verifyFirebaseToken(idToken: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken, true);
      const email = decoded.email || `${decoded.uid}@firebase.local`;
      let user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            passwordHash: '',
            role: Role.MEMBER,
            member: {
              create: {
                fullName: decoded.name || 'Member',
                dob: new Date('1990-01-01'),
                contact: '',
                address: '',
              },
            },
          },
        });
      }
      return { userId: user.id, role: user.role, email: user.email };
    } catch (e) {
      return null;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    return this.buildTokens(user.id, user.email, user.role);
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        role: dto.role,
        member: {
          create: {
            fullName: dto.fullName,
            dob: new Date(dto.dob),
            contact: dto.contact,
            address: dto.address,
          },
        },
      },
      include: { member: true },
    });
    return this.buildTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
      return this.buildTokens(decoded.sub, decoded.email, decoded.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private buildTokens(sub: string, email: string, role: Role) {
    const payload = { sub, email, role };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, role };
  }
}
