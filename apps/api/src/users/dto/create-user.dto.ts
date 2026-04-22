import { IsEmail, IsIn, IsNotEmpty, MinLength } from 'class-validator';
import type { Role } from '../../common/guards/roles.guard';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsIn(['ADMIN', 'CEO', 'TELLER', 'COLLECTOR', 'MEMBER', 'DIRECTOR'])
  role: Role;
}
