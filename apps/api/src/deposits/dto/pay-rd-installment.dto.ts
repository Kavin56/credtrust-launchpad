import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class PayRdInstallmentDto {
  @IsString()
  @IsNotEmpty()
  scheduleId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  paidOn: string; // ISO date string

  @IsString()
  @IsNotEmpty()
  accountId: string; // Account from which payment is made
}
