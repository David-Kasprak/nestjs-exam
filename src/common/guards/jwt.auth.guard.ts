import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
      return false;
    }

    try {
      const user = this.jwtService.verify(token); // Декодируем токен
      request.user = user; // Сохраняем данные пользователя в request для использования в дальнейшем
      return true;
    } catch (e) {
      return false; // Если токен не валиден, доступ закрыт
    }
  }
}
