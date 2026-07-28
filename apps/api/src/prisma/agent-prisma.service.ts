import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@credtrust/prisma-agent';

@Injectable()
export class AgentPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(AgentPrismaService.name);

  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.AGENT_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Agent database connected successfully');
    } catch (error) {
      this.logger.warn(
        `Agent database connection failed: ${(error as Error).message}. Will retry on first query.`,
      );
      this.retryConnectionInBackground();
    }
  }

  private retryConnectionInBackground() {
    const attempt = async (retryCount: number) => {
      const delay = Math.min(5000 * Math.pow(2, retryCount), 60000);
      await new Promise((r) => setTimeout(r, delay));
      try {
        await this.$connect();
        this.logger.log('Agent database reconnected successfully');
      } catch {
        if (retryCount < 10) {
          this.logger.warn(
            `Agent DB retry ${retryCount + 1} failed, next attempt in ${Math.min(5000 * Math.pow(2, retryCount + 1), 60000) / 1000}s`,
          );
          attempt(retryCount + 1);
        } else {
          this.logger.error('Agent database connection failed after 10 retries');
        }
      }
    };
    attempt(0);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
