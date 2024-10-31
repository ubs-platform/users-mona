import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class UserIntercept extends AuthGuard('jwt') {
  override handleRequest(err: any, user: any) {
    if (user) return user;
    return null;
  }
}
