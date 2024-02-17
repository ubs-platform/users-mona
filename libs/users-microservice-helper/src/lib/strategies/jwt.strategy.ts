import { Inject, Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// import { User } from 'libs/backend-global/ubs/users/src/lib/domain/user.model';
// import { SECRET_JWT } from 'libs/backend-global/ubs/users/src/lib/util/consts';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../service/user.service';
import { UserDTO } from '@ubs-platform/users-common';
import { SECRET_JWT } from '@ubs-platform/jwt-consts';

@Injectable({})
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: SECRET_JWT,
    });
  }

  async validate(validationPayload: { userId: any }): Promise<UserDTO> {
    return this.userService.findUserAuth(validationPayload.userId);
  }
}
