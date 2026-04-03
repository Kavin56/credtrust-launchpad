import { DepositKind } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDepositDto {
  @IsEnum(DepositKind)
  kind: DepositKind;

  @IsNumber()
  principal: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  tenureMonths: number;

  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  payoutMode: string;

  @IsString()
  accountId: string;
}
