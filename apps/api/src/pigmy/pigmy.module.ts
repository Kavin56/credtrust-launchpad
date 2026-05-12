import { Module } from '@nestjs/common';
import { PigmyService } from './pigmy.service';
import { PigmyController } from './pigmy.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PigmyController],
  providers: [PigmyService],
  exports: [PigmyService],
})
export class PigmyModule {}
