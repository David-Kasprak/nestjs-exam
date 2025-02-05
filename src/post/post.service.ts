import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/post.create.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class PostService {
  // private logger: Logger;
  constructor(
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createPost(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const existingPost = await this.postRepository.findOne({
      where: { user_id: user.id },
    });

    if (existingPost) {
      throw new ConflictException(
        'User can only have one created post. Either delete your existing post, or update it instead',
      );
    }

    const post = this.postRepository.create({
      ...createPostDto,
      user_id: user.id,
    });

    await this.postRepository.save(post);
    return post;
  }

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
