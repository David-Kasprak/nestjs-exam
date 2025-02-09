import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/post.create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { User } from '../database/entities/user.entity';
import { PostResponseDto } from './dto/post.response.dto';
import { UpdatePostDto } from './dto/post.update.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createPost(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      user_id: user.id,
    });

    await this.postRepository.save(post);
    return post;
  }

  async getPostsOfUser(
    userId: string,
    page: number,
    limit: number,
    take: number,
    skip: number,
  ): Promise<{
    data: PostResponseDto[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const [posts, total] = await this.postRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
    });

    if (posts.length === 0) {
      throw new NotFoundException(`No posts found for user with id ${userId}`);
    }

    const postDtos = posts.map(this.toPostResponseDto);

    return {
      page: +page,
      limit: +limit,
      totalCount: +total,
      data: postDtos,
    };
  }

  private toPostResponseDto(post: Post): PostResponseDto {
    const { id, title, description, body } = post;
    return { id, title, description, body };
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user_id !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    if (updatePostDto.title) {
      post.title = updatePostDto.title;
    }

    if (updatePostDto.description) {
      post.description = updatePostDto.description;
    }

    if (updatePostDto.body) {
      post.body = updatePostDto.body;
    }

    await this.postRepository.save(post);
    return post;
  }

  async deletePost(
    user: User,
    postId: string,
  ): Promise<{ responseMessage: string }> {
    const userFound = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!userFound) {
      throw new NotFoundException('User not found, or token is not valid');
    }

    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.user_id !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);

    return { responseMessage: 'Post has been deleted' };
  }
}
