import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FirebaseRegisterDto } from './dto/firebase-register.dto';
import { initializeFirebaseAdmin } from '../common/utils/firebase';

type FirebaseIdentity = {
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
};

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
    const firebaseAuth = this.getFirebaseAuth();
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    if (!decoded.email) {
      throw new UnauthorizedException('Firebase account does not expose an email.');
    }

    return {
      firebaseUid: decoded.uid,
      email: decoded.email,
      emailVerified: !!decoded.email_verified,
      name: typeof decoded.name === 'string' ? decoded.name : undefined,
    } satisfies FirebaseIdentity;
  }

  async login(dto: any) {
    const user = await this.validateUser(dto.email, dto.password);
    const member = await this.prisma.member.findUnique({
      where: { userId: user.id },
    });
    const tokens = this.buildTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      hasMemberProfile: !!member || user.role !== 'MEMBER',
    };
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

    // Member profile will be created via the multi-step signup flow
    const tokens = this.buildTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      hasMemberProfile: false,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET;
      if (!secret) throw new UnauthorizedException('JWT_REFRESH_SECRET is not configured.');
      const decoded: any = this.jwtService.verify(refreshToken, { secret });
      return this.buildTokens(decoded.sub, decoded.email, decoded.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async authenticateBearerToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException('JWT_SECRET is not configured.');
    try {
      const decoded: any = this.jwtService.verify(token, { secret });
      return { userId: decoded.sub, role: decoded.role, email: decoded.email };
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }

  async createFirebaseSessionFromToken(firebaseIdentity: FirebaseIdentity) {
    return this.buildFirebaseSession(firebaseIdentity);
  }

  async registerFirebaseUser(
    firebaseIdentity: FirebaseIdentity,
    dto: FirebaseRegisterDto,
  ) {
    const user = await this.findOrCreateUserFromFirebase(firebaseIdentity, dto.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: dto.role || user.role || 'MEMBER',
        lastLoginAt: new Date(),
      },
    });

    return {
      userId: user.id,
      email: user.email,
      role: dto.role || user.role || 'MEMBER',
      memberId: null,
      hasMemberProfile: false,
    };
  }

  async grantFirebaseAdminAccess(
    firebaseIdentity: FirebaseIdentity,
    secretKey: string,
  ) {
    const expectedSecret = process.env.ADMIN_SIGNUP_SECRET;
    if (!expectedSecret) throw new UnauthorizedException('ADMIN_SIGNUP_SECRET is not configured.');
    if (secretKey !== expectedSecret) {
      throw new UnauthorizedException('Invalid admin access key.');
    }

    const user = await this.findOrCreateUserFromFirebase(firebaseIdentity, 'ADMIN');

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        role: 'ADMIN',
        lastLoginAt: new Date(),
      },
    });

    return {
      userId: user.id,
      email: user.email,
      role: 'ADMIN',
      hasMemberProfile: false,
    };
  }

  private async buildFirebaseSession(firebaseIdentity: FirebaseIdentity) {
    // CRITICAL: Only look up the user — never create one here.
    // A DB user is only created atomically inside complete-profile (with KYC docs).
    const user = await this.prisma.user.findUnique({
      where: { email: firebaseIdentity.email },
    });

    // New user — needs to complete full registration with KYC documents first.
    if (!user) {
      return {
        pendingRegistration: true,
        email: firebaseIdentity.email,
        firebaseUid: firebaseIdentity.firebaseUid,
        hasMemberProfile: false,
      };
    }

    const member = await this.prisma.member.findUnique({
      where: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Existing user without member profile (incomplete registration — edge case)
    if (!member && user.role === 'MEMBER') {
      return {
        pendingRegistration: true,
        userId: user.id,
        email: user.email,
        role: user.role,
        hasMemberProfile: false,
      };
    }

    // Fully registered user — return tokens.
    const tokens = this.buildTokens(user.id, user.email, user.role);
    return {
      ...tokens,
      userId: user.id,
      email: user.email,
      role: user.role,
      memberId: member?.memberId || null,
      hasMemberProfile: !!member || user.role !== 'MEMBER',
    };
  }

  /**
   * Used only for ADMIN and PORTAL flows — creates user if they don't exist.
   */
  private async findOrCreateUserFromFirebase(
    firebaseIdentity: FirebaseIdentity,
    preferredRole = 'MEMBER',
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: firebaseIdentity.email },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.user.create({
      data: {
        email: firebaseIdentity.email,
        passwordHash: await bcrypt.hash(firebaseIdentity.firebaseUid, 10),
        role: preferredRole,
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Called from MembersService.completeProfile to create a new User + Member atomically.
   * Only called after KYC documents have been uploaded successfully.
   */
  async createMemberUser(firebaseIdentity: FirebaseIdentity): Promise<{ id: string; email: string; role: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: firebaseIdentity.email },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.user.create({
      data: {
        email: firebaseIdentity.email,
        passwordHash: await bcrypt.hash(firebaseIdentity.firebaseUid, 10),
        role: 'MEMBER',
        lastLoginAt: new Date(),
      },
    });
  }

  private async generateMemberId(district: string) {
    const districtCode = this.getDistrictCode(district);
    const prefix = `SRN-${districtCode}`;
    
    // Find the last member with this district prefix
    const lastMember = await this.prisma.member.findFirst({
      where: {
        memberId: {
          startsWith: prefix,
        },
      },
      orderBy: {
        memberId: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastMember) {
      const lastIdParts = lastMember.memberId.split('-');
      const lastNum = parseInt(lastIdParts[lastIdParts.length - 1]);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
  }

  private getDistrictCode(district: string): string {
    const mapping: Record<string, string> = {
      'Chennai': 'CHN',
      'Tiruvallur': 'TRL',
      'Kancheepuram': 'KPM',
      'Chengalpattu': 'CPT',
      'Coimbatore': 'CBE',
      'Madurai': 'MDU',
      'Trichy': 'TRY',
      'Salem': 'SLM',
    };
    
    return mapping[district] || district.substring(0, 3).toUpperCase();
  }

  private getFirebaseAuth() {
    initializeFirebaseAdmin();
    return getAuth();
  }

  private buildTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!secret || !refreshSecret) throw new Error('JWT secrets are not configured.');

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '24h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, role };
  }

  async checkMemberProfile(userId: string) {
    if (!userId) return null;
    return this.prisma.member.findUnique({
      where: { userId },
    });
  }
}
