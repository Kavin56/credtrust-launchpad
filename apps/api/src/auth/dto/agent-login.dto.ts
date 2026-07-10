import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AgentLoginDto {
  @ApiProperty({ example: 'agent@saranam.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '482910', description: '6-digit OTP sent to registered email' })
  @IsString()
  @IsNotEmpty()
  agentId: string;
}
