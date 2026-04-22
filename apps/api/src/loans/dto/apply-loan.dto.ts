import {
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator';

export class ApplyLoanDto {
  @IsString()
  memberId: string;

  @IsString()
  type: string; // Personal, Home, Gold etc

  @IsNumber()
  amount: number;

  @IsNumber()
  interestRate: number;

  @IsNumber()
  termMonths: number;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsString()
  guarantorDetail?: string;

  @IsOptional()
  @IsString()
  employmentStatus?: string;

  @IsOptional()
  @IsNumber()
  monthlyIncome?: number;

  @IsOptional()
  @IsObject()
  documents?: any; // JSON object containing document URLs
}
