import { Module } from '@nestjs/common';
import { ShareholdersController } from './shareholders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [ShareholdersController],
})
export class ShareholdersModule {}
