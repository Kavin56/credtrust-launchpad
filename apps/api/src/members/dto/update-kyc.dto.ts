import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateKycDto {
  @IsIn(['PENDING', 'APPROVED', 'REJECTED'])
  status: string;

  @IsOptional()
  @IsString()
  verifiedBy?: string;
}
