import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UploadedFiles,
  HttpException,
  Put, HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserDto,
  AccountResponseDto,
  UserItemDto,
  FindUserDto,
} from './dto/user.dto';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseQueryDto } from '../common/validators/base.query.validator';
import {
  ApiPaginatedResponse,
  PaginatedDto,
} from '../common/interfaces/response.interface';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleGuard } from '../common/guards/role.guard';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, PATH_TO_IMAGE } from '../common/utils/upload.utils';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import * as uuidValidator from 'uuid-validate';
import { FilterUsersDto } from './dto/user.filter.dto';
import { User } from '../database/entities/user.entity';
import { GetUser } from '../common/decorators/user.get.decorator';
import { UpdateUserDto } from './dto/user.update.dto';
import { PaginationDto } from './dto/pagination.dto';

// @UseGuards(AuthGuard())
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

  // @ApiResponse({ status: HttpStatus.CREATED, type: AccountResponseDto })
  // @Post('/create')
  // async createUser(@Body() createUserDto: UserDto) {
  //   return this.userService.create(createUserDto);
  // }
  //
  // @Roles('Admin', 'Manager')
  // @UseGuards(AuthGuard(), RoleGuard)
  // @ApiPaginatedResponse('entities', UserItemDto)
  // @Get('/list')
  // findAll(@Query() query: BaseQueryDto) {
  //   return this.userService.findAll(query);
  // }
  //
  // @Patch('avatar')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     storage: diskStorage({
  //       destination: `.${PATH_TO_IMAGE}`,
  //       filename: editFileName,
  //     }),
  //   }),
  // )
  // updateAvatar(
  //   @Param('id') id: string,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new MaxFileSizeValidator({ maxSize: 1000000000 }), // bytes
  //         new FileTypeValidator({ fileType: 'image/png' }),
  //       ],
  //     }),
  //   )
  //   file: Express.Multer.File,
  // ) {
  //   return this.userService.findOne(Number(id), file.filename);
  // }
  //
  // @UseGuards(AuthGuard())
  // @Patch('gallery')
  // @UseInterceptors(
  //   FileFieldsInterceptor(
  //     [
  //       { name: 'image', maxCount: 1 },
  //       { name: 'imageLogo', maxCount: 1 },
  //     ],
  //     {
  //       storage: diskStorage({
  //         destination: `.${PATH_TO_IMAGE}`,
  //         filename: editFileName,
  //       }),
  //     },
  //   ),
  // )
  // updateImages(
  //   @Param('id') id: string,
  //   @UploadedFiles()
  //   files: { image?: Express.Multer.File[]; imageLogo?: Express.Multer.File[] },
  //   @Body() body: any,
  //   @Req() req: any,
  // ) {
  //   if (files?.image) {
  //     body.photo = `${PATH_TO_IMAGE}/${files.image[0].filename}`;
  //   }
  //   if (files?.imageLogo) {
  //     body.logo = `${PATH_TO_IMAGE}/${files.imageLogo[0].filename}`;
  //   }
  //   return this.userService.updateOne(Number(id), body, req.user);
  // }
  //
  // @Roles('Admin')
  // @UseGuards(AuthGuard(), RoleGuard)
  // @Patch('/roles/:id')
  // update(@Param('id') id: string) {
  //   return this.userService.update(+id);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
