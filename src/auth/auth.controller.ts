import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ForgotPassword, SingUpDto, UserDto } from '../user/dto/user.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt.auth.guard';
import { Request as ExpressRequest } from 'express';
import { LogoutDto } from './dto/logout.dto';
import { GetUser } from '../common/decorators/user.get.decorator';
import { User } from '../database/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOkResponse({ type: SingUpDto })
  @Post('register')
  @HttpCode(201)
  async register(@Body() body: RegisterDto): Promise<User> {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@GetUser() user: User): Promise<string> {
    return this.authService.logout(user);
  }
}
