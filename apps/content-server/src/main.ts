/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { hidePoweredBy } from '@slb-delfi-exploration/dd-infrastructure';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as expressRequestId from 'express-request-id';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(expressRequestId());
  app.use(hidePoweredBy());
  const port = process.env.CONTENT_SERVER_PORT || 3337;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
