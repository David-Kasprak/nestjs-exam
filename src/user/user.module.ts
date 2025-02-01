// import { Module } from '@nestjs/common';
// import { UserService } from './user.service';
// import { UserController } from './user.controller';
// import { AuthModule } from '../auth/auth.module';
// import { AuthService } from '../auth/auth.service';
//
// @Module({
//   imports: [AuthModule],
//   controllers: [UserController],
//   providers: [UserService, AuthService],
//   exports: [UserService],
// })
// export class UserModule {}

// src/user/user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { SocketModule } from '@nestjs/websockets/socket-module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    SocketModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

