import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class DepositTransactionDto {
  @IsNumber()
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  paymentMode: string; // CASH, CHEQUE, ONLINE

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
