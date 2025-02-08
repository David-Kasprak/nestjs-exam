import {
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDto, UserItemDto } from './dto/user.dto';
import { BaseQueryDto } from '../common/validators/base.query.validator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { paginateRawAndEntities } from 'nestjs-typeorm-paginate';
import { PaginatedDto } from '../common/interfaces/response.interface';
import { Post } from '../database/entities/post.entity';
import { PATH_TO_IMAGE } from '../common/utils/upload.utils';
import * as fs from 'fs';
import { SocketGateway } from '../socket/socket.gateway';
import { FilterUsersDto } from './dto/user.filter.dto';
import { UpdateUserDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly socket: SocketGateway,
  ) {}
  private usersList = [];
  async create(createUserDto: UserDto) {
    const index = new Date().valueOf();
    this.usersList.push({
      ...createUserDto,
      id: index,
    });
    return this.usersList[0];
  }

  async findAll(query?: BaseQueryDto, user?: any): Promise<any> {
    const options = {
      page: +query?.page || 1,
      limit: +query?.limit || 10,
    };

    // const queryBuilder = await this.userRepository
    //     .createQueryBuilder('user')
    //     .leftJoinAndSelect('user.posts', 'post')
    //     .where('"isActive" = false')
    //     .skip((options.page - 1) * options.limit)
    //     .take(options.limit);
    //
    // const count =  await queryBuilder.getCount();

    // const select = 'email, "firstName", age, id, "createdAt"';

    // queryBuilder
    //   .select('email, "firstName", age, id, "createdAt"')
    //   .where({ isActive: false });
    //
    // if (query.search) {
    //   queryBuilder.andWhere(`LOWER("firstName") LIKE '%${query.search}%'`);
    // }
    //
    // const [pagination, rawEntities] = await paginateRawAndEntities(
    //   queryBuilder,
    //   options,
    // );
    //
    // return {
    //   page: pagination.meta.currentPage,
    //   pages: pagination.meta.totalPages,
    //   countItems: pagination.meta.totalItems,
    //   entities: rawEntities as [UserItemDto],
    // };

    const [entities, total] = await this.userRepository.findAndCount({
      select: {
        email: true,
        id: true,
      },
      relations: {
        posts: true,
      },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return {
      page: options.page,
      pages: Math.ceil(total / options.limit),
      countItems: total,
      entities: entities,
    };
  }

  // --------------------------------------

  async getAllUsers(page: number, limit: number) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      page,
      limit,
      totalCount: total,
      data: users,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async filterUsers(
    email: string,
    createdAfter: string,
    createdBefore: string,
    firstName: string,
    pageParam: number,
    limitParam: number,
    skipParam: number,
    takeParam: number,
  ): Promise<{
    data: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (firstName) {
      queryBuilder.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${firstName}%`,
      });
    }

    if (email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${email}%`,
      });
    }

    if (createdAfter) {
      queryBuilder.andWhere('user.createdAt > :createdAfter', {
        createdAfter: createdAfter,
      });
    }

    if (createdBefore) {
      queryBuilder.andWhere('user.createdAt < :createdBefore', {
        createdBefore: createdBefore,
      });
    }

    const page = pageParam || 1;
    const limit = limitParam;

    const skip = (page - 1) * limit;
    const take = limit;

    queryBuilder.skip(skip).take(take);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      page: +page,
      limit: +limit,
      totalCount: total,
      data: users,
    };
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== userId) {
      throw new ForbiddenException('You can only update yourself');
    }

    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    await this.userRepository.save(user);
    return user;
  }

  async deleteUser(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found, or token is not valid');
    }

    await this.userRepository.remove(user);

    return 'User has been deleted';
  }

  // ------------------------------------

  findOne(id: number, fileName?: any) {
    if (fileName) {
      const avatarPath = `${PATH_TO_IMAGE}/${fileName}`;
      console.log(avatarPath); /// { avatar: avatarPath }
    }
    return this.usersList.find((user) => user.id == id);
  }

  async updateOne(id: number, body?: any, user?: any) {
    // try {
    //   fs.unlinkSync(`./upload/1286888386033841.png`);
    // } catch (err) {
    //   console.log(err)
    // }

    if (user) {
      await this.socket.sendMessage(user.id, 'new-massage', {
        message: 'Hello!',
        date: '',
      });
    }

    return true;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
