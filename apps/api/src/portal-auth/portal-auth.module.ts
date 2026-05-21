import { Module } from '@nestjs/common';
import { PortalAuthService } from './portal-auth.service';
import { PortalAuthController } from './portal-auth.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PortalAuthController],
  providers: [PortalAuthService],
  exports: [PortalAuthService],
})
export class PortalAuthModule {}
