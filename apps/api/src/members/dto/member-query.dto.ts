import { IsOptional, IsEnum, IsString } from 'class-validator';
import { KycStatus, MemberStatus } from '@prisma/client';

export class MemberQueryDto {
  @IsOptional()
  @IsEnum(KycStatus)
  kycStatus?: KycStatus;

  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}
