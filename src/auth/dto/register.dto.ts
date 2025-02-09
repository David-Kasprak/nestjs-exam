import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.trim())
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  @Transform(({ value }) => value.trim())
  email: string;

  @IsString()
  @Matches(/^\S*(?=\S{8,})(?=\S*[A-Z])(?=\S*[\d])\S*$/, {
    message:
      'Password must have 1 upper case, 1 lower case, number, and special symbol',
  })
  @IsNotEmpty()
  password: string;
}
