import { Module } from '@nestjs/common';
import { DividendsService } from './dividends.service';
import { DividendsController } from './dividends.controller';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [LedgerModule],
  controllers: [DividendsController],
  providers: [DividendsService],
})
export class DividendsModule {}
