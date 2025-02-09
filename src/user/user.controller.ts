import {
  Controller,
  Get,
  Body,
  Delete,
  Query,
  UseGuards,
  HttpException,
  Put,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserItemDto } from './dto/user.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { PaginatedDto } from '../common/interfaces/response.interface';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import * as uuidValidator from 'uuid-validate';
import { User } from '../database/entities/user.entity';
import { GetUser } from '../common/decorators/user.get.decorator';
import { UpdateUserDto } from './dto/user.update.dto';

@ApiTags('User')
@ApiExtraModels(UserItemDto, PaginatedDto)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{
    data: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    return this.userService.getAllUsers(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('find/byId')
  @HttpCode(200)
  async findUserById(@Query('id') id: string): Promise<User> {
    if (id && uuidValidator(id)) {
      return this.userService.findById(id);
    }

    throw new HttpException('Provide id of the user', 400);
  }

  @UseGuards(JwtAuthGuard)
  @Get('find/byEmail')
  @HttpCode(200)
  async findUserByEmail(@Query('email') email: string): Promise<User> {
    if (email) {
      return this.userService.findByEmail(email);
    }

    throw new HttpException('Provide email of the user', 400);
  }

  @UseGuards(JwtAuthGuard)
  @Get('filter')
  @HttpCode(200)
  async filterUsers(
    @Query('email') email: string,
    @Query('createdAfter') createdAfter: string,
    @Query('createdBefore') createdBefore: string,
    @Query('firstName') firstName: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<{
    data: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    return this.userService.filterUsers(
      email,
      createdAfter,
      createdBefore,
      firstName,
      page,
      limit,
      skip,
      take,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @HttpCode(200)
  async updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.updateUser(user.id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @HttpCode(200)
  async deleteUser(@GetUser() user: User): Promise<string> {
    return this.userService.deleteUser(user.id);
  }
}
