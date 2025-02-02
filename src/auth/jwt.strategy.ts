import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    @InjectRedisClient() private readonly redisClient: RedisClient,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'Secret',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    try {
      const tokenExists = await this.redisClient.exists(
        `user-token-${payload.id}`,
      );
      if (!tokenExists) {
        throw new UnauthorizedException('Token is no longer valid');
      }

      const user = await this.authService.validateUser(
        payload.id,
        payload.email,
      );
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
