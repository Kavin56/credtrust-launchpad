import { IsNotEmpty, IsString } from 'class-validator';

export class FirebaseAdminAccessDto {
  @IsNotEmpty()
  @IsString()
  secretKey: string;
}
