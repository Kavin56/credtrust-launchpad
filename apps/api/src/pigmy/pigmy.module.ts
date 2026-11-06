import { Module } from '@nestjs/common';
import { PigmyService } from './pigmy.service';
import { PigmyController } from './pigmy.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, AuthModule, CommonModule],
  controllers: [PigmyController],
  providers: [PigmyService],
  exports: [PigmyService],
})
export class PigmyModule {}
