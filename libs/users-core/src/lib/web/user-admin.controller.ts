import {
  UserAuth,
  UserDTO,
  UserFullDto,
  UserGeneralInfoDTO,
} from '@lotus-web/ubs-common/users';
import {
  Body,
  Controller,
  Delete,
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
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from '../services/user.service';
import { JwtAuthLocalGuard } from '../guard/jwt-local.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { FileUploadHelperService } from '@lotus-web/backend-global/ubs/file-backend-helper';
import { CurrentUser } from '../local-current-user-decorator';
import { User } from '../domain/user.model';
import { EmailChangeRequestService } from '../services/email-change-request.service';
import { Roles, RolesGuard } from '@lotus-web/backend-global/ubs/roles';
@Controller('_adm_/user')
@Roles(['ADMIN'])
export class UserAdminController {
  constructor(private userService: UserService) {}

  @Get()
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthLocalGuard, RolesGuard)
  async listAllUsers() {
    return await this.userService.fetchAllUsers();
  }

  @Get(':id')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthLocalGuard, RolesGuard)
  async fetchFull(@Param() params: { id: any }) {
    return await this.userService.findFullInfo(params.id);
  }

  @Put()
  @UseGuards(JwtAuthLocalGuard, RolesGuard)
  @Roles(['ADMIN'])
  async updateUser(@Body() full: UserFullDto) {
    if (full._id == null) {
      throw 'id gereklidir';
    }
    console.info(full);
    return await this.userService.editUserFullInformation(full);
  }

  @Post()
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthLocalGuard, RolesGuard)
  async createUser(@Body() full: UserFullDto) {
    return await this.userService.addUserFullInformation(full);
  }

  @Delete(':id')
  @Roles(['ADMIN'])
  @UseGuards(JwtAuthLocalGuard, RolesGuard)
  async deleteUser(@Param() params: { id: any }) {
    return await this.userService.deleteUser(params.id);
  }
}
