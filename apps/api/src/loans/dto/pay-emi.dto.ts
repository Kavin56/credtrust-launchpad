import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PayEmiDto {
  @IsString()
  scheduleId: string;

  @IsNumber()
  amount: number;

  @IsDateString()
  paidOn: string;

  @IsNotEmpty()
  accountId: string;
}
