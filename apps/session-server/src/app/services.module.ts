import { AppHealthService } from '@apollo/app/health';
import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { environment } from '../environments/environment';
import { LogController } from './controllers/log.controller';
import { SessionController } from './controllers/session.controller';
import { ConfigFactory, ConfigModule } from './providers/config/config.module';
import { SessionStorageModule } from './providers/session-storage/session-storage.module';
import { LogService } from './services/log.service';
import { SessionService } from './services/session.service';

@Module({
  imports: [
    HttpModule,
    ServerAspectLoggerModule.forRoot({
      logger: new Logger('ASPECT LOGGER'),
      production: environment.production
    }),
    ServerRequestContextModule,
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
    ServerTracingModule.forRoot(ConfigFactory(process).getTracingConfig()),
    ConfigModule,
    SessionStorageModule
  ],
  controllers: [LogController, SessionController],
  providers: [LogService, SessionService, Logger, AppHealthService]
})
export class ServicesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser(), ServerRequestContextMiddleware, JwtTokenMiddleware).exclude('api/session/health').forRoutes('*');
  }
}
