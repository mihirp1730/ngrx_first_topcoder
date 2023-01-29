import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { RequestValidationMiddleware } from '@apollo/server/request-validation-middleware';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import cookieParser = require('cookie-parser');

import { environment } from '../environments/environment';
import { MemoryStorageService } from './services/memory-storage.service';
import { StorageController } from './storage.controller';

@Module({
  imports: [
    HttpModule,
    ServerAspectLoggerModule.forRoot({
      production: environment.production,
      logger: new Logger('ASPECT LOGGER')
    }),
    ServerLoggerModule.forRoot({
      production: environment.production,
      formatter: traceLogFormatter,
      addSeverity: true,
      redactPaths: [
        'req.headers.authorization',
        'req.headers.appkey',
        'req.headers.cookie',
        'res.headers.etag',
        'req.headers["x-api-key"]',
        'res.headers["set-cookie"]'
      ]
    }),
    ServerTracingModule.forRoot(environment.tracingConfig),
    ServerRequestContextModule
  ],
  controllers: [StorageController],
  providers: [MemoryStorageService]
})
export class StorageModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(cookieParser(), ServerRequestContextMiddleware, JwtTokenMiddleware, RequestValidationMiddleware('storage-server', process.env))
      .forRoutes('*');
  }
}
