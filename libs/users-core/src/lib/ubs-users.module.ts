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
import { BackendJwtUtilsExportModule } from '@ubs-platform/users-mona-microservice-helper';
import {
  PwResetRequest,
  PwResetRequestSchema,
} from './domain/pw-reset-request.schema';
import { PasswordResetService } from './services/password-reset.service';
import { ResetPasswordController } from './web/password-reset.controller';
import { ClientsModule } from '@nestjs/microservices';
import { getMicroserviceConnection } from '@ubs-platform/nest-microservice-setup-util';
import { EmailService } from './services/email.service';

@Module({
  controllers: [
    UserController,
    AuthController,
    UserAdminController,
    ResetPasswordController,
  ],

  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailChangeRequest.name, schema: EmailChangeRequestSchema },
      { name: PwResetRequest.name, schema: PwResetRequestSchema },
    ]),
    ...BackendJwtUtilsExportModule,
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        ...getMicroserviceConnection(''),
      } as any,
    ]),
  ],
  providers: [
    UserService,
    AuthService,
    EmailChangeRequestService,
    JwtAuthLocalGuard,
    JwtLocalStrategy,
    PasswordResetService,
    EmailService,
  ],
  exports: [],
})
export class UbsUsersCoreModule {}
