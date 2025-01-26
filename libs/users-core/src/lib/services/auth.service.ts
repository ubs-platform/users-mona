import {
  ErrorInformations,
  UBSUsersErrorConsts,
  UserAuth,
  UserAuthSuccess,
} from '@ubs-platform/users-common';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import { Request } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async currentUserByJwtForFirstLogin(request: Request) {
    const jwt = request.headers.authorization
      ?.replace('Bearer ', '')
      ?.replace('bearer ', '');

    const jwtDecoded = await this.jwtService.verifyAsync(jwt);

    const a = jwtDecoded['userId'];
    const ab = await this.userService.findUserAuth(a);
    if (ab.active) {
      return ab;
    } else {
      throw new UnauthorizedException();
    }
  }

  async authenticateUser(userLogin: UserAuth) {
    console.info(userLogin)
    let realUser = await this.userService.findUserByLoginAndPw(userLogin);
    // const correspond = realUser.passwordEncyripted == passwdHashed;
    if (realUser) {
      const payload = {
        userId: realUser.id,
      };
      const token = this.jwtService.sign(payload);
      return new UserAuthSuccess(token);
    } else {
      throw new ErrorInformations(
        UBSUsersErrorConsts.AUTHENTICATION_FAIL,
        'User is not found or password does not match'
      );
    }
  }

  async verifyToken(token: string) {
    const verifed = await this.jwtService.verifyAsync(token);
    return verifed != null;
  }
}
