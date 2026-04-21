import { IsEnum, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { DepositType } from '@prisma/client';

export class CreateDepositAccountDto {
  @IsString()
  memberId: string;

  @IsEnum(DepositType)
  type: DepositType;

  @IsNumber()
  interestRate: number;

  @IsOptional()
  @IsNumber()
  maturityAmount?: number;

  @IsOptional()
  @IsDateString()
  maturityDate?: string;
}
