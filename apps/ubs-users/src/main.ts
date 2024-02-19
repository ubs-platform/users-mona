/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { getMicroserviceConnection } from '@ubs-platform/nest-microservice-setup-util';
import { exec } from 'child_process';
import { execArgv } from 'process';

async function bootstrap() {
  exec('wall ' + process.env.NX_KAFKA_PORT);
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice(getMicroserviceConnection(''));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
