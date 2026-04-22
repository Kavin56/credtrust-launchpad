import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import type { Role } from '../../common/guards/roles.guard';

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

  @IsNotEmpty()
  @MinLength(12)
  aadhaarNumber: string;

  @IsNotEmpty()
  @MinLength(10)
  panNumber: string;

  @IsNotEmpty()
  nomineeName: string;

  @IsNotEmpty()
  nomineeRelation: string;

  @IsNotEmpty()
  nomineeAge: number;

  @IsIn(['ADMIN', 'CEO', 'TELLER', 'COLLECTOR', 'MEMBER', 'DIRECTOR'])
  role: Role;
}
