import { ServerLogger } from '@apollo/server/server-logger';
import { setupSwagger } from '@apollo/swagger';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app/app.module';
import { getConfig } from './app/modules/config/config-provider/get-config';
import { makeSwaggerDoc } from './app/swagger-doc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { appPort, appUrlPrefix } = getConfig(process.env);

  app.useLogger(app.get(ServerLogger));
  app.setGlobalPrefix(appUrlPrefix);
  app.use(cookieParser());
  // Generate swagger file
  await setupSwagger(app, makeSwaggerDoc(app), {
    buildFilePath: 'apps/auth-server/build/deploy/swagger.yaml'
  });
  await app.listen(appPort);
}

bootstrap();
