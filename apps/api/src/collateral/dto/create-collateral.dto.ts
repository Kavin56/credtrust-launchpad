import { IsNotEmpty, IsString, IsOptional, IsNumber, Min } from 'class-validator'

export class CreateCollateralDto {
  @IsString()
  @IsNotEmpty()
  type: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNumber()
  @Min(0)
  value: number

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  fileUrl?: string
}
