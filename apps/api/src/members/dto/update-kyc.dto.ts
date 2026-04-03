import { IsEnum, IsOptional, IsString } from 'class-validator';
import { KycStatus } from '@prisma/client';

export class UpdateKycDto {
  @IsEnum(KycStatus)
  status: KycStatus;

  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
