import { IsString, IsNumber, IsEnum, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePigmySchemeDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['DAILY', 'WEEKLY', 'MONTHLY'] })
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  type: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  maxAmount: number;

  @ApiProperty({ default: 3.0 })
  @IsNumber()
  @IsOptional()
  interestRate?: number;

  @ApiProperty({ default: 6 })
  @IsNumber()
  @IsOptional()
  interestPeriod?: number;

  @ApiProperty()
  @IsNumber()
  maturityPeriod: number;
}

export class EnrollPigmyAccountDto {
  @ApiProperty()
  @IsString()
  memberId: string;

  @ApiProperty()
  @IsString()
  schemeId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  agentId?: string;

  @ApiProperty()
  @IsOptional()
  startDate?: Date;
}

export class AddCollectionDto {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: ['CASH', 'UPI'] })
  @IsEnum(['CASH', 'UPI'])
  method: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  upiId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class UpdateCollectionStatusDto {
  @ApiProperty({ enum: ['PENDING', 'COMPLETED', 'REJECTED'] })
  @IsEnum(['PENDING', 'COMPLETED', 'REJECTED'])
  status: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  agentId?: string;
}

export class InitiatePaymentDto {
  @ApiProperty()
  @IsString()
  accountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty()
  @IsString()
  customerEmail: string;

  @ApiProperty()
  @IsString()
  customerPhone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}

export class ConfirmPaymentDto {
  @ApiProperty()
  @IsString()
  collectionId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  referenceId?: string;
}
