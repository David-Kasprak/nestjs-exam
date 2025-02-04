import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ForgotPassword, SingUpDto, UserDto } from '../user/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';

@Injectable()
export class AuthService {
  private redisUserKey = 'user-token';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly jwtService: JwtService,
  ) {}

  // async singUpUser(data: UserDto): Promise<{ accessToken: string }> {
  //   const findUser = await this.userRepository.findOne({
  //     where: { email: data.email },
  //   });
  //   if (findUser) {
  //     throw new BadRequestException('User with this email already exist.');
  //   }
  //   const password = await bcrypt.hash(data.password, 10);
  //   const user: User = await this.userRepository.save(
  //     this.userRepository.create({ ...data, password }),
  //   );
  //
  //   const token = await this.signIn(String(user.id), user.email);
  //
  //   await this.redisClient.setEx(
  //     `${this.redisUserKey}-${user.id}`,
  //     24 * 60 * 60,
  //     token,
  //   );
  //
  //   // logout
  //   // await this.redisClient.del(`${this.redisUserKey}-${user.id}`);
  //
  //   // -------------------------
  //   // await this.redisClient.setEx('user', 2 * 60, JSON.stringify(user));
  //
  //   // const userInRedis = JSON.parse(
  //   //   await this.redisClient.get(this.redisUserKey),
  //   // );
  //   // -------------------------
  //   // const userInRedisSecond = JSON.parse(
  //   //   await this.redisClient.get('user'),
  //   // );
  //   // console.log(userInRedis);
  //
  //   return { accessToken: token };
  // }

  // ------------REGISTER

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

  // // ------------------------------------------

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

  async login(data: LoginDto) {
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

  async logout(data: LogoutDto) {
    const userId = data.userId;

    if (!userId) {
      throw new BadRequestException('User not found, enter userId');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.redisClient.del(`${this.redisUserKey}-${userId}`);

    return { message: 'Logged out successfully' };
  }

  // async logout(userId: string) {
  //   await this.redisClient.del(`user-token-${userId}`);
  //   return { message: 'User logged out successfully' };
  // }

  // async logoutUser(userId: string) {
  //   const tokenKey = `${this.redisUserKey}-${userId}`;
  //   const exists = await this.redisClient.exists(tokenKey);
  //
  //   if (!exists) {
  //     throw new BadRequestException('User is not logged in or session expired');
  //   }
  //
  //   await this.redisClient.del(tokenKey);
  //
  //   return { message: 'User logged out successfully' };
  // }

  async validate(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  // create(data: ForgotPassword) {
  //   if (data.password !== data.repeatPassword) {
  //   }
  //   return 'This action adds a new auth';
  // }
  //
  // findAll() {
  //   return `This action returns all auth`;
  // }
  //
  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }
  //
  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
