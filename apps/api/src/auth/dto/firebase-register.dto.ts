import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FirebaseRegisterDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  role?: string;
}
