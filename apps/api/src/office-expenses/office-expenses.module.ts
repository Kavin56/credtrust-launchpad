import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OfficeExpensesController } from './office-expenses.controller';
import { OfficeExpensesService } from './office-expenses.service';

@Module({
  imports: [PrismaModule],
  controllers: [OfficeExpensesController],
  providers: [OfficeExpensesService],
  exports: [OfficeExpensesService]
})
export class OfficeExpensesModule {}
