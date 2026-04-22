import { IsIn, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDepositAccountDto {
  @IsString()
  memberId: string;

  @IsIn(['RD', 'FD', 'SAVINGS'])
  type: string;

  @IsNumber()
  interestRate: number;

  @IsOptional()
  @IsNumber()
  maturityAmount?: number;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
