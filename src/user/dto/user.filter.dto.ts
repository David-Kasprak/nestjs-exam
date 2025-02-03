import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterUsersDto {
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  createdAfter?: string;

  @IsString()
  @IsOptional()
  createdBefore?: string;

  @IsNumber()
  @IsOptional()
  skip?: number;

  @IsNumber()
  @IsOptional()
  take?: number;
}
