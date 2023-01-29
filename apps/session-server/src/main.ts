import { ServerLogger } from '@apollo/server/server-logger';
import { setupSwagger } from '@apollo/swagger';
import { NestFactory } from '@nestjs/core';

import { ServicesModule } from './app/services.module';
import { makeSwaggerDoc } from './app/swagger-doc';

async function bootstrap() {
  const app = await NestFactory.create(ServicesModule);
  const port = process.env.SESSION_SERVER_LISTEN_PORT || 3335;

  app.useLogger(app.get(ServerLogger));
  app.setGlobalPrefix('api');
  // Generate swagger file
  await setupSwagger(app, makeSwaggerDoc(app), {
    buildFilePath: 'apps/session-server/build/deploy/swagger.yaml'
  });
  await app.listen(port);
}

bootstrap();
