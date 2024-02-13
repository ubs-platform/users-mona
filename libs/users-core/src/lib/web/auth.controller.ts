import {
  UserAuth,
  UserAuthBackendDTO,
  UserDTO,
} from '@lotus-web/ubs-common/users';
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
import { matchRoles } from '@lotus-web/backend-global/ubs/roles';
import { Request } from 'express';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  async authenticate(@Body() user: UserAuth) {
    try {
      return await this.authService.authenticateUser(user);
    } catch (error) {
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
    return matchRoles(roleList, user.roles);
  }

  @Post('/logout')
  @UseGuards(JwtAuthLocalGuard)
  async logout() {
    // cmon do something
  }
}
