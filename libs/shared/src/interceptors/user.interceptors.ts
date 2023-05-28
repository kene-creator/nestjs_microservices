import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ClientProxy } from '@nestjs/microservices';

import { Observable, switchMap, catchError, tap } from 'rxjs';

import { UserJwt } from '../interface/user-jwt.interface';
import { UserRequest } from '../interface/user-request.interface';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    if (ctx.getType() !== 'http') return next.handle();

    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return next.handle();

    const authHeaderParts = authHeader.split(' ');

    if (authHeaderParts.length !== 2) return next.handle();

    const [, jwt] = authHeaderParts;

    return this.authService
      .send<UserRequest>({ cmd: 'decode-jwt' }, { jwt })
      .pipe(
        tap((value) => console.log('Value emitted:', value)),
        switchMap(({ user }) => {
          console.log(4, user);
          request.user = user;
          return next.handle();
        }),
        catchError(() => next.handle()),
      );
  }
}
