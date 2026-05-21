import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { JwtAuthGuard } from './jwt.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, FirebaseAuthGuard, JwtAuthGuard],
  exports: [AuthService, FirebaseAuthGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
