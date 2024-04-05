import { Inject, Injectable, Scope } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { firstValueFrom } from "rxjs";
import { UserService } from "../service/user.service";
import { SECRET_JWT } from "../utils/jwt-consts";
import { UserDTO } from "@ubs-platform/users-common";

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
