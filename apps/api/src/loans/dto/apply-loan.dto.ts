import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ApplyLoanDto {
  @IsString()
  product: string;

  @IsNumber()
  principal: number;

  @IsNumber()
  rate: number;

  @IsNumber()
  tenureMonths: number;

  @IsDateString()
  sanctionDate: string;

  @IsOptional()
  @IsString()
  collateral?: string;
}
