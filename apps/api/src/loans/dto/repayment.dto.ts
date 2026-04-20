import { IsNumber, IsString, IsOptional } from 'class-validator';

export class LoanRepaymentDto {
  @IsNumber()
  amount: number;

  @IsNumber()
  @IsOptional()
  penaltyAmount?: number = 0;

  @IsString()
  paymentMode: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
