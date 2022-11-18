import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../modules/users/models/user';

@Injectable()
export class EmailGuard implements CanActivate {
  private static EMAIL_NOT_VERIFIED = new UnauthorizedException(
    'EMAIL_NOT_VERIFIED',
    "Your email isn't verified yet.",
  );

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let user: User;

    if (context.getType() === 'http') {
      user = context.switchToHttp().getRequest().user;
    } else {
      const ctx = GqlExecutionContext.create(context);
      user = ctx.getContext().req.user;
    }

    if (user.emailVerified) {
      return true;
    } else {
      throw EmailGuard.EMAIL_NOT_VERIFIED;
    }
  }
}
