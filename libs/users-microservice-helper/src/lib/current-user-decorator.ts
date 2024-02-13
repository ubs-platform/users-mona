import { UserDTO } from '@lotus-web/ubs-common/users';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user
);
