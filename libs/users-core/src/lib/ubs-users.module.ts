import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.model';
import { UserService } from './services/user.service';
import { UserController } from './web/user.controller';
import { AuthController } from './web/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthLocalGuard } from './guard/jwt-local.guard';
import { JwtLocalStrategy } from './strategies/jwt-local-strategy';
import {
  EmailChangeRequest,
  EmailChangeRequestSchema,
} from './domain/email-change-request.schema';
import { EmailChangeRequestService } from './services/email-change-request.service';
import { UserAdminController } from './web/user-admin.controller';
import { BackendJwtUtilsExportModule } from '@ubs-platform/';

@Module({
  controllers: [UserController, AuthController, UserAdminController],

  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([
      { name: EmailChangeRequest.name, schema: EmailChangeRequestSchema },
    ]),
    ...BackendJwtUtilsExportModule,
  ],
  providers: [
    UserService,
    AuthService,
    EmailChangeRequestService,
    JwtAuthLocalGuard,
    JwtLocalStrategy,
  ],
  exports: [],
})
export class UbsUsersCoreModule {}
