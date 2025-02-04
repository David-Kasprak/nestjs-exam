import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  readonly firstName?: string;

  @IsOptional()
  @IsEmail()
  readonly email?: string;
}
