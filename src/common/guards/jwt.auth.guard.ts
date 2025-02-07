import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Используем AuthGuard из Passport

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor() {
    super();
  }

  // Дополнительная логика, если необходимо
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// import { Injectable } from '@nestjs/common';
// import { CanActivate, ExecutionContext } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { Observable } from 'rxjs';
//
// @Injectable()
// export class JwtAuthGuard implements CanActivate {
//   constructor(private jwtService: JwtService) {}
//
//   canActivate(
//     context: ExecutionContext,
//   ): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const token = request.headers['authorization']?.replace('Bearer ', '');
//
//     if (!token) {
//       return false;
//     }
//
//     try {
//       const user = this.jwtService.verify(token);
//       request.user = user;
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }
// }
