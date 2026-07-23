import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AdminPrismaService } from '../prisma/admin-prisma.service';
import { AgentPrismaService } from '../prisma/agent-prisma.service';
import { AdminPortalLoginDto } from './dto/admin-portal-login.dto';
import { AgentPortalLoginDto } from './dto/agent-portal-login.dto';

@Injectable()
export class PortalAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminPrisma: AdminPrismaService,
    private readonly agentPrisma: AgentPrismaService,
  ) {}

  async adminLogin(dto: AdminPortalLoginDto) {
    const expectedKey =
      process.env.ADMIN_ACCESS_KEY || process.env.ADMIN_SIGNUP_SECRET;
    if (!expectedKey) {
      throw new UnauthorizedException('ADMIN_ACCESS_KEY is not configured.');
    }
    if (dto.adminKey !== expectedKey) {
      throw new UnauthorizedException('Invalid admin access key.');
    }

    const admin = await this.adminPrisma.adminUser.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!admin || admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.adminPrisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildTokens(admin.id, admin.email, 'ADMIN');
  }

  async agentLogin(dto: AgentPortalLoginDto) {
    const input = dto.username.trim().toLowerCase();
    // Allow login by username or email
    const agent = await this.agentPrisma.agent.findFirst({
      where: {
        OR: [
          { username: input },
          { email: input },
        ],
      },
    });

    if (!agent) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (agent.status === 'PENDING_APPROVAL' || agent.status === 'Pending Approval') {
      throw new UnauthorizedException('Agent account is pending admin approval.');
    }
    if (agent.status === 'REJECTED') {
      throw new UnauthorizedException('Agent registration request was rejected by admin.');
    }
    if (agent.status !== 'ACTIVE') {
      throw new UnauthorizedException('Agent account is inactive.');
    }

    if (!dto.uniqueAgentKey || !agent.uniqueAgentKey || agent.uniqueAgentKey.trim() !== dto.uniqueAgentKey.trim()) {
      throw new UnauthorizedException('Invalid Unique Agent Key.');
    }

    const ok = await bcrypt.compare(dto.password, agent.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.agentPrisma.agent.update({
      where: { id: agent.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      ...this.buildTokens(agent.id, agent.username, 'AGENT'),
      agentCode: agent.agentCode,
      fullName: agent.fullName,
    };
  }

  private buildTokens(sub: string, email: string, role: string) {
    const payload = { sub, email, role };
    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!secret || !refreshSecret) {
      throw new Error('JWT secrets are not configured.');
    }

    const accessToken = this.jwtService.sign(payload, {
      secret,
      expiresIn: '24h',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      role,
      userId: sub,
      email,
    };
  }
}
