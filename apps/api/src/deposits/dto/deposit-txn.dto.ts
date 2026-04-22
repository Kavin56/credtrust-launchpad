import { IsIn, IsNumber, IsString, IsOptional } from 'class-validator';

export class DepositTransactionDto {
  @IsNumber()
  amount: number;

  @IsIn(['DEPOSIT', 'WITHDRAWAL', 'INTEREST', 'DIVIDEND', 'PENALTY', 'SHARE_PURCHASE'])
  type: string;

  @IsString()
  paymentMode: string; // CASH, CHEQUE, ONLINE

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
