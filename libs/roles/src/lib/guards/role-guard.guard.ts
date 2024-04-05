import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator/roles.decorator';
import { matchRoles } from '../match-role';
import { UserAuthBackendDTO } from '@ubs-platform/users-common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    } else {
      roles.push('ADMIN');
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as UserAuthBackendDTO;
    return matchRoles(roles, user.roles);
  }
}
