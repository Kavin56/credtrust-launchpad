import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Primary database connected successfully');
    } catch (error) {
      this.logger.warn(
        `Primary database connection failed: ${(error as Error).message}. Will retry on first query.`,
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
        this.logger.log('Primary database reconnected successfully');
      } catch {
        if (retryCount < 10) {
          this.logger.warn(
            `Primary DB retry ${retryCount + 1} failed, next attempt in ${Math.min(5000 * Math.pow(2, retryCount + 1), 60000) / 1000}s`,
          );
          attempt(retryCount + 1);
        } else {
          this.logger.error('Primary database connection failed after 10 retries');
        }
      }
    };
    attempt(0);
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
