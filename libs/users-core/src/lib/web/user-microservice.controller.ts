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
  Headers,
  UseInterceptors,
} from '@nestjs/common';
import {
  ClientKafka,
  EventPattern,
  MessagePattern,
} from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { JwtAuthLocalGuard } from '../guard/jwt-local.guard';
import { CurrentUser } from '../local-current-user-decorator';
import { EmailChangeRequestService } from '../services/email-change-request.service';
import {
  UserRegisterDTO,
  UserGeneralInfoDTO,
  UserDTO,
  UserAuthBackendDTO,
} from '@ubs-platform/users-common';
@Controller()
export class UserMicroserviceController {
  constructor(
    private userService: UserService,
    @Inject('KAFKA_CLIENT') private kafkaClient: ClientKafka
  ) {
    this.kafkaClient.emit('register-category', {
      category: 'PROFILE_PHOTO',
      serviceTcpHost: process.env['U_USERS_MONA_INTERNAL_COM_HOST'],
      serviceTcpPort: process.env['U_USERS_MONA_INTERNAL_COM_PORT'],
    });
  }

  @Post()
  async registerUser(@Body() user: UserRegisterDTO, @Headers() headers: any) {
    try {
      await this.userService.registerUser(user, headers?.['origin']);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @MessagePattern('file-upload-PROFILE_PHOTO')
  async changeProfilePhoto(data: { userId: any }) {
    console.info('test');
    const category = 'PROFILE_PHOTO',
      name = data.userId;
    return { category, name, volatile: false, maxLimitBytes: 3000000 };
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
  }
}
