import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/user.module';
import { MembersModule } from './members/members.module';
import { DepositsModule } from './deposits/deposits.module';
import { LoansModule } from './loans/loans.module';
import { LedgerModule } from './ledger/ledger.module';
import { DividendsModule } from './dividends/dividends.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { LoggerModule } from 'nestjs-pino';
import { StorageModule } from './storage/storage.module';
import { AccountsModule } from './accounts/accounts.module';
import { AdminModule } from './admin/admin.module';
import { PigmyModule } from './pigmy/pigmy.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    PrismaModule,
    StorageModule,
    AccountsModule,
    AdminModule,
    AuthModule,
    UsersModule,
    MembersModule,
    DepositsModule,
    LoansModule,
    LedgerModule,
    DividendsModule,
    ReportsModule,
    NotificationsModule,
    PigmyModule,
  ],
  providers: [
/*
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
*/
/*
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
*/
  ],
})
export class AppModule {}
