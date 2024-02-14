import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { JwtAuthLocalGuard } from '../guard/jwt-local.guard';
import { CurrentUser } from '../local-current-user-decorator';
import { EmailChangeRequestService } from '../services/email-change-request.service';
import {
  UserRegisterDTO,
  UserGeneralInfoDTO,
  UserDTO,
  UserAuthBackendDTO,
} from '@ubs-platform/users-mona-common';
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private emailChangeRequestService: EmailChangeRequestService
  ) {}

  @Post()
  async registerUser(@Body() user: UserRegisterDTO) {
    try {
      await this.userService.registerUser(user);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('/current/general')
  @UseGuards(JwtAuthLocalGuard)
  async updateGeneralUserInformation(
    @Body() data: UserGeneralInfoDTO,
    @CurrentUser() user: UserGeneralInfoDTO
  ) {
    console.info(data);
    return await this.userService.editUserGeneralInformation(data, user.id);
  }

  @Get('/current/general')
  @UseGuards(JwtAuthLocalGuard)
  async fetchGeneralUserInformation(@CurrentUser() user: UserGeneralInfoDTO) {
    return await this.userService.fetchUserGeneralInformation(user);
  }

  @Put('/current/email')
  @UseGuards(JwtAuthLocalGuard)
  async changeEmail(
    @CurrentUser() currentUser: UserDTO,
    @Body() { email }: { email: string }
  ) {
    try {
      return this.emailChangeRequestService.insertNewRequest(
        currentUser.id,
        email
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/current/email/:id')
  @UseGuards(JwtAuthLocalGuard)
  async approveChangeEmail(
    @Param() params: { id: any },
    @CurrentUser() currentUser: UserDTO,
    @Body() { code }: { code: string }
  ) {
    try {
      await this.emailChangeRequestService.approveEmailChange(
        currentUser.id,
        params.id,
        code
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Put('/current/password')
  @UseGuards(JwtAuthLocalGuard)
  async changePassword(
    @CurrentUser() currentUser: UserDTO,
    @Body()
    pwChange: {
      currentPassword: string;
      newPassword: string;
    }
  ) {
    try {
      await this.userService.changePassword(currentUser.id, pwChange);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @MessagePattern('file-upload-PROFILE_PHOTO')
  async changeProfilePhoto(data: { userId: any }) {
    console.info('test');
    const category = 'PROFILE_PHOTO',
      name = data.userId;
    return { category, name };
  }

  @MessagePattern('user-by-id')
  async findUserAuthFromId(id: any): Promise<UserAuthBackendDTO> {
    return await this.userService.findUserAuthBackend(id);
  }

  @MessagePattern('user-role-check')
  async hasUserRoleOrJew({
    userId,
    role,
  }: {
    userId: string;
    role: string;
  }): Promise<boolean> {
    return await this.userService.hasUserRoleAtLeastOneOrAdmin(userId, role);
  }

  @EventPattern('user-role-insert')
  async insertRole({
    userId,
    role,
  }: {
    userId: string;
    role: string;
  }): Promise<void> {
    await this.userService.insertRole(userId, role);
    // return await this.userService.hasUserRoleOrJew(roles);
  }

  @EventPattern('user-role-remove')
  async removeRole(userId: string, role: string): Promise<void> {
    await this.userService.removeRole(userId, role);

    // return await this.userService.hasUserRoleOrJew(roles);
  }
}
