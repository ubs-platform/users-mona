import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthLocalGuard } from '../guard/jwt-local.guard';
import { CurrentUser } from '../local-current-user-decorator';
import { AuthService } from '../services/auth.service';
import { Request } from 'express';
import { UserAuth, UserAuthBackendDTO } from '@ubs-platform/users-common';
import { matchRolesOrAdm } from '@ubs-platform/users-mona-roles';
import { UserIntercept } from '../guard/user-intercept';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async authenticate(@Body() user: UserAuth) {
    try {
      console.info(user);

      user.login = user.login?.toLowerCase();
      return await this.authService.authenticateUser(user);
    } catch (error) {
      console.error(error)
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
  // Promise<UserDTO>
  @Get()
  async getSelfUser(@Req() request: Request): Promise<any> {
    return await this.authService.currentUserByJwtForFirstLogin(request);
  }

  @Post('has-role')
  @UseGuards(JwtAuthLocalGuard)
  async hasRole(
    @CurrentUser() user: UserAuthBackendDTO,
    @Body() roleList: string[]
  ): Promise<boolean> {
    return matchRolesOrAdm(roleList, user.roles);
  }

  @Post('/logout')
  @UseGuards(UserIntercept)
  async logout(@CurrentUser() user: UserAuthBackendDTO) {
    if (user) {
      // cmon do something
    }
    // cmon do something
  }
}
