import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BackendJwtUtilsExportModule } from './backend-jwt-utils-exports.module';
import { CommunicationHelper } from './guards/communication-handler';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from './service/user.service';
import { getMicroserviceConnection } from '@ubs-platform/nest-microservice-setup-util';
import { INTERNAL_COMMUNICATION } from '../../../consts/consts';
// import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [],
  providers: [CommunicationHelper, JwtStrategy, UserService],
  exports: [UserService],
  imports: [
    ...BackendJwtUtilsExportModule,
    ClientsModule.register([
      // {
      //   name: 'KAFKA_CLIENT',
      //   ...getMicroserviceConnection(''),
      // } as any,
      {
        name: 'USER_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          port: INTERNAL_COMMUNICATION.port,
          host: INTERNAL_COMMUNICATION.host,
        },
      },
    ]),
  ],
})
export class BackendJwtUtilsModule {}
