import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  dob: string;

  @IsNotEmpty()
  contact: string;

  @IsNotEmpty()
  address: string;

  @IsEnum(Role)
  role: Role;
}
