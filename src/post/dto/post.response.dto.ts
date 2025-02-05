import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @ApiProperty()
  body: string;
}
