import { IsOptional, IsString, IsNumber, Min } from 'class-validator'

export class UpdateCollateralDto {
  @IsOptional()
  @IsString()
  type?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  fileUrl?: string
}
