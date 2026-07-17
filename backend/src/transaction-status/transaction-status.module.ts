import { Module } from '@nestjs/common';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatusService } from './transaction-status.service';

@Module({
  controllers: [TransactionStatusController],
  providers: [TransactionStatusService]
})
export class TransactionStatusModule {}
