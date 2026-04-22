import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FirebaseRegisterDto } from './dto/firebase-register.dto';

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

  async authenticateBearerToken(token: string) {
    try {
      const decoded: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });
      return { userId: decoded.sub, role: decoded.role, email: decoded.email };
    } catch {
      const firebaseIdentity = await this.verifyFirebaseToken(token);
      return this.buildFirebaseSession(firebaseIdentity);
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
    const count = await this.prisma.member.count();
    const memberId = `MEM${(count + 1).toString().padStart(4, '0')}`;

    const member = await this.prisma.member.upsert({
      where: { userId: user.id },
      update: {
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        contact: dto.contact,
        address: dto.address,
      },
      create: {
        userId: user.id,
        memberId,
        fullName: dto.fullName,
        dob: new Date(dto.dob),
        contact: dto.contact,
        address: dto.address,
        aadhaarNumber: `firebase-aadhaar-${firebaseIdentity.firebaseUid}`,
        panNumber: `firebase-pan-${firebaseIdentity.firebaseUid}`,
      },
      include: { user: true },
    });

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
      memberId: member.id,
      hasMemberProfile: true,
    };
  }

  async grantFirebaseAdminAccess(
    firebaseIdentity: FirebaseIdentity,
    secretKey: string,
  ) {
    const expectedSecret =
      process.env.ADMIN_SIGNUP_SECRET || 'CREDTRUST_ADMIN_2026';
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
    };
  }

  private async buildFirebaseSession(firebaseIdentity: FirebaseIdentity) {
    const user = await this.findOrCreateUserFromFirebase(firebaseIdentity);
    const member = await this.prisma.member.findUnique({
      where: { userId: user.id },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    if (!member && user.role === 'MEMBER') {
      const createdMember = await this.prisma.member.create({
        data: {
          userId: user.id,
          memberId: await this.generateMemberId(),
          fullName:
            firebaseIdentity.name ||
            firebaseIdentity.email.split('@')[0] ||
            'Member',
          dob: new Date('1970-01-01'),
          contact: 'Pending',
          address: 'Pending',
          aadhaarNumber: `firebase-aadhaar-${firebaseIdentity.firebaseUid}`,
          panNumber: `firebase-pan-${firebaseIdentity.firebaseUid}`,
        },
      });

      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        memberId: createdMember.id,
        hasMemberProfile: true,
      };
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      memberId: member?.id || null,
      hasMemberProfile: !!member || user.role !== 'MEMBER',
    };
  }

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

  private async generateMemberId() {
    const count = await this.prisma.member.count();
    return `MEM${(count + 1).toString().padStart(4, '0')}`;
  }

  private getFirebaseAuth() {
    if (!getApps().length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!projectId || !clientEmail || !privateKey) {
        throw new UnauthorizedException('Firebase admin credentials are missing.');
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    return getAuth();
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
