import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Query,
  Put,
  HttpCode,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/post.create.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { GetUser } from '../common/decorators/user.get.decorator';
import { User } from '../database/entities/user.entity';
import { Post as PostEntity } from '../database/entities/post.entity';
import { PostResponseDto } from './dto/post.response.dto';
import { PaginationDto } from '../user/dto/pagination.dto';
import { PostsOfUserFind } from './dto/post.ofUser.find';
import { UpdatePostDto } from './dto/post.update.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @HttpCode(201)
  async createPost(
    @GetUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postService.createPost(user, createPostDto);
  }

  @Get('user/find')
  @HttpCode(200)
  async getPostsOfUser(
    @Query('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ): Promise<{
    data: PostResponseDto[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    return this.postService.getPostsOfUser(userId, page, limit, skip, take);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update')
  @HttpCode(200)
  async updatePost(
    @GetUser() user: User,
    @Body() body: { postId: string; updatePostDto: UpdatePostDto },
  ): Promise<PostEntity> {
    const { postId, updatePostDto } = body;
    return this.postService.updatePost(user.id, postId, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  @HttpCode(200)
  async deletePost(
    @GetUser() user: User,
    @Body() body: { postId: string },
  ): Promise<string> {
    const { postId } = body;
    return this.postService.deletePost(user, postId);
  }
}
