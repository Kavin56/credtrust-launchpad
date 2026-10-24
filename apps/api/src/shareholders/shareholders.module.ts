import { Module } from '@nestjs/common';
import { ShareholdersController } from './shareholders.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShareholdersController],
})
export class ShareholdersModule {}
