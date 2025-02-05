import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/post.create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { User } from '../database/entities/user.entity';
import { PostResponseDto } from './dto/post.response.dto';
import { PaginationDto } from '../user/dto/pagination.dto';

@Injectable()
export class PostService {
  // private logger: Logger;
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
    paginationDto: PaginationDto, // Пагинация приходит как DTO
  ): Promise<{
    data: PostResponseDto[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = paginationDto;

    // Находим посты с учетом пагинации
    const [posts, total] = await this.postRepository.findAndCount({
      where: { user_id: userId },
      skip: (page - 1) * limit, // Пропускаем записи
      take: limit, // Количество записей на странице
      relations: ['user'], // В случае необходимости, можно подключить связи
    });

    if (posts.length === 0) {
      throw new NotFoundException(`No posts found for user with id ${userId}`);
    }

    // Преобразуем посты в DTO перед возвратом
    const postDtos = posts.map(this.toPostResponseDto);

    return {
      page: page,
      limit: limit,
      totalCount: total,
      data: postDtos,
    };
  }

  // Метод преобразования сущности Post в PostResponseDto
  private toPostResponseDto(post: Post): PostResponseDto {
    const { id, title, description, body } = post;
    return { id, title, description, body };
  }

  //--- V.1 Working well
  // async getPostsOfUser(userId: string): Promise<Post[]> {
  //   return this.postRepository.find({
  //     where: { user_id: userId },
  //     // relations: ['user'],
  //   });
  // }

  // async getPostsOfUser(userId: string): Promise<PostResponseDto> {
  //   const posts = await this.postRepository.find({
  //     where: { user_id: userId },
  //   });
  //
  //   return posts;
  // }

  // ------------------------------

  // async create(data: PostDto) {
  //   try {
  //     const post = await this.postRepository.save(
  //       this.postRepository.create({
  //         ...data,
  //         user_id: '886ecc01-6c01-4933-86bd-a8b56228d4cb',
  //       }),
  //     );
  //     return post;
  //   } catch (err) {
  //     throw new BadRequestException('Creat post failed.');
  //   }
  // }

  // findAll() {
  //   return `This action returns all post`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} post`;
  // }
  //
  // update(id: number, updatePostDto: PostDto) {
  //   return `This action updates a #${id} post`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
