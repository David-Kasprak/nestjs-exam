// // src/auth/auth.module.ts
// import { forwardRef, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { User } from 'src/user/entities/user.entity';
// import { UserModule } from '../user/user.module';
//
// @Module({
//   imports: [TypeOrmModule.forFeature([User]), forwardRef(() => UserModule)],
//   controllers: [AuthController],
//   providers: [AuthService],
// })
// export class AuthModule {}

// src/auth/auth.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { RedisModule } from '@webeleon/nestjs-redis';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RedisModule.forFeature()),
    PassportModule.register({
      defaultStrategy: 'bearer',
      session: true,
    }),
    JwtModule.register({
      global: true,
      secret: 'Secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
