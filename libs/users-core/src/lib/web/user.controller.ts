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
} from '@ubs-platform/users-common';
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private emailChangeRequestService: EmailChangeRequestService
  ) {}

  @Post()
  async registerUser(@Body() user: UserRegisterDTO, @Headers() headers: any) {
    try {
      await this.userService.registerUser(user, headers?.['origin']);
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
      await this.userService.changePasswordLogged(currentUser.id, pwChange);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('activate/:key')
  public async activate(@Param() { key }: { key: string }) {
    await this.userService.activateUserByKey(key);
  }
}
