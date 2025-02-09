import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private redisUserKey = 'user-token';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { firstName, email, password } = registerDto;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new HttpException(
        'Email is already in use, try another email',
        409,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      firstName,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return user;
  }

  async validateUser(userId: string, userEmail: string): Promise<User> {
    if (!userId || !userEmail) {
      throw new UnauthorizedException();
    }
    const user = this.userRepository.findOne({
      where: {
        id: userId,
        email: userEmail,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signIn(userId: string, userEmail: string): Promise<string> {
    return this.jwtService.sign({ id: userId, email: userEmail });
  }

  async compareHash(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async login(data: LoginDto): Promise<{ accessToken: string }> {
    const findUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!findUser) {
      throw new BadRequestException('Wrong email or password');
    }

    if (!(await this.compareHash(data.password, findUser.password))) {
      throw new BadRequestException('Wrong email or password');
    }

    const token = await this.signIn(String(findUser.id), findUser.email);

    await this.redisClient.setEx(
      `${this.redisUserKey}-${findUser.id}`,
      24 * 60 * 60,
      token,
    );

    return { accessToken: token };
  }

  async logout(userDto: User): Promise<string> {
    const userId = userDto.id;

    if (!userId) {
      throw new BadRequestException(
        'User not found, provide valid accessToken',
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.redisClient.del(`${this.redisUserKey}-${userId}`);

    return 'Logged out successfully';
  }

  async validate(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
