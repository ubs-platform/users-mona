import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UbsUsersCoreModule } from '@ubs-platform/users-mona-core';
@Module({
  imports: [
    UbsUsersCoreModule,
    MongooseModule.forRoot(
      `mongodb://admin:admin@${
        process.env.NX_MONGO_URL || 'localhost'
      }/?authMechanism=DEFAULT`,
      {
        dbName: 'ubs_users',
      }
    ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
