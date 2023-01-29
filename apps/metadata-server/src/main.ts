import { hidePoweredBy, injectHeadersMiddlewere } from '@slb-delfi-exploration/dd-infrastructure';

import { CorrelationIdMiddleware } from '../../../libs/server/correlation-id-middleware/correlation-id.middleware';
import { MetadataServerModule } from './app/metadata.server.module';
import { NestFactory } from '@nestjs/core';
import { ServerLogger } from '@apollo/server/server-logger';

async function bootstrap() {
  const app = await NestFactory.create(MetadataServerModule);
  const port = process.env.METADATA_SERVER_PORT || 3334;

  app.useLogger(app.get(ServerLogger));
  app.setGlobalPrefix('api/metadata');
  app.use(hidePoweredBy());
  app.use(CorrelationIdMiddleware());
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
