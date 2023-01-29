import { ServerLogger } from '@apollo/server/server-logger';
import { NestFactory } from '@nestjs/core';
import { hidePoweredBy, injectHeadersMiddlewere } from '@slb-delfi-exploration/dd-infrastructure';
import * as expressRequestId from 'express-request-id';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.GATEWAY_SERVER_PORT || 3338;

  app.useLogger(app.get(ServerLogger));
  app.setGlobalPrefix('api/gateway');
  app.use(expressRequestId());
  app.use(hidePoweredBy());
  app.use(
    injectHeadersMiddlewere({
      'Cache-Control': 'no-cache, no-store',
      Pragma: 'no-cache',
      Expires: '0',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'sameorigin',
      'X-XSS-Protection': '1; mode=block'
    })
  );
  await app.listen(port);
}

bootstrap();
