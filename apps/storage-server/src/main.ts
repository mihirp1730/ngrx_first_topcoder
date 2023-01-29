import { NestFactory } from '@nestjs/core';
import { injectHeadersMiddlewere } from '@slb-delfi-exploration/dd-infrastructure';

import { StorageModule } from './app/storage.module';

async function bootstrap() {
  const app = await NestFactory.create(StorageModule);
  const globalPrefix = 'api/storage';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.STORAGE_SERVER_PORT || 3339;
  app.use(
    injectHeadersMiddlewere({
      'Cache-Control': 'public; max-age=300',
      Expires: '300s',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'sameorigin',
      'X-XSS-Protection': '1; mode=block'
    })
  );
  await app.listen(port);
}

bootstrap();
