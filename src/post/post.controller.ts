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

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createPost(
    @GetUser() user: User,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.createPost(user, createPostDto);
  }

  @Post('user/find')
  async getPostsOfUser(@Body() body: PostsOfUserFind): Promise<{
    data: PostResponseDto[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const { userId, page, limit, take, skip } = body;
    return this.postService.getPostsOfUser(userId, page, limit, skip, take);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async deletePost(
    @GetUser() user: User,
    @Body() body: { postId: string },
  ): Promise<string> {
    const { postId } = body;
    return this.postService.deletePost(user, postId);
  }

  // V.1 Working well
  // @Get('user/:userId')
  // async getPostsOfUser(
  //   @Param('userId') userId: string,
  // ): Promise<PostResponseDto[]> {
  //   const posts = await this.postService.getPostsOfUser(userId);
  //   if (!posts || posts.length === 0) {
  //     throw new NotFoundException(`No posts found for user with id ${userId}`);
  //   }
  //   // Преобразуем посты в DTO перед возвратом
  //   return posts.map((post) => this.toPostResponseDto(post));
  // }
  //
  // // Метод преобразования сущности Post в PostResponseDto
  // private toPostResponseDto(post: PostEntity): PostResponseDto {
  //   const { id, title, description, body } = post;
  //   return { id, title, description, body };
  // }

  // @Post('posts')
  // async getPostsOfUser(@Body() userId: string): Promise<PostResponseDto> {
  //   return this.postService.getPostsOfUser(userId);
  // }

  // @Get()
  // findAll() {
  //   return this.postService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: PostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postService.remove(+id);
  // }
}
