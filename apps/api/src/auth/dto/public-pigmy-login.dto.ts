import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublicPigmyLoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'PIGMY0001' })
  @IsString()
  pigmyAccountNumber: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fullName?: string;
}
