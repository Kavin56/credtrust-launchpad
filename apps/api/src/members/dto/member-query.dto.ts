import { IsOptional, IsIn, IsString } from 'class-validator';

export class MemberQueryDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  kycStatus?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'EXITED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 10;
}
