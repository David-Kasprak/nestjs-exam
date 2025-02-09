import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(
    page: number,
    limit: number,
  ): Promise<{
    data: User[];
    totalCount: number;
    page: number;
    limit: number;
  }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      page: +page,
      limit: +limit,
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

  async deleteUser(userId: string): Promise<{ responseMessage: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found, or token is not valid');
    }

    await this.userRepository.remove(user);

    return { responseMessage: 'User has been deleted' };
  }
}
