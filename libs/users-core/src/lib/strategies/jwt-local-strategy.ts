import { UserDTO } from '@lotus-web/ubs-common/users';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { User } from 'libs/backend-global/ubs/users/src/lib/domain/user.model';
import { SECRET_JWT } from 'libs/backend-global/ubs/users/src/lib/util/consts';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable()
export class JwtLocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SECRET_JWT,
    });
  }

  async validate(validationPayload: { userId: any }): Promise<UserDTO | null> {
    console.debug(validationPayload.userId);
    return this.userService.findUserAuthBackend(validationPayload.userId);
  }
}
