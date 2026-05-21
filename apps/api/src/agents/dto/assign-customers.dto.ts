import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class AssignCustomersDto {
  @IsString()
  @IsNotEmpty()
  agentId: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  accountIds: string[];
}
