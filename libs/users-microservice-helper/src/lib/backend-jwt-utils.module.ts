import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { getMicroserviceConnection } from 'libs/constants/microservice-communication-setup';
import { BackendJwtUtilsExportModule } from './backend-jwt-utils-exports.module';
import { CommunicationHelper } from './guards/communication-handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from './service/user.service';
// import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [],
  providers: [CommunicationHelper, JwtStrategy, UserService],
  exports: [UserService],
  imports: [
    ...BackendJwtUtilsExportModule,
    ClientsModule.register([
      {
        name: 'USER_CLIENT',
        ...getMicroserviceConnection(),
      } as any,
    ]),
  ],
})
export class BackendJwtUtilsModule {}
