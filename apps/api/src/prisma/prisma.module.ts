import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AdminPrismaService } from './admin-prisma.service';
import { AgentPrismaService } from './agent-prisma.service';

@Global()
@Module({
  providers: [PrismaService, AdminPrismaService, AgentPrismaService],
  exports: [PrismaService, AdminPrismaService, AgentPrismaService],
})
export class PrismaModule {}
