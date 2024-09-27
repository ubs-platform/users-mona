import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BackendJwtUtilsExportModule } from './backend-jwt-utils-exports.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserService } from './service/user.service';
import { getMicroserviceConnection } from '@ubs-platform/nest-microservice-setup-util';
import { EntityOwnershipService } from './service/entity-ownership.service';
// import { JwtStrategy } from './strategies/jwt.strategy';
export const INTERNAL_COMMUNICATION = {
  port: parseInt(process.env['U_USERS_MONA_INTERNAL_COM_PORT'] || '0'),
  host: process.env['U_USERS_MONA_INTERNAL_COM_HOST'],
};

@Module({
  controllers: [],
  providers: [JwtStrategy, UserService, EntityOwnershipService],
  exports: [UserService, EntityOwnershipService],
  imports: [
    ...BackendJwtUtilsExportModule,

    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        ...getMicroserviceConnection(''),
      } as any,
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
