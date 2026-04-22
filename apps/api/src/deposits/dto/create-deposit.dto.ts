import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDepositDto {
  @IsString()
  kind: string;

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
