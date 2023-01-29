import { AppHealthService } from '@apollo/app/health';
import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { JwtTokenValidationMiddleware } from '@apollo/server/jwt-token-validation-middleware';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { RequestValidationMiddleware } from '@apollo/server/request-validation-middleware';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { get } from 'lodash';

import { environment } from '../environments/environment';
import { AppController } from './app.controller';
import { FileManagerService } from './file-manager/file-manager.service';
import { SubscriptionService } from './subscription/subscription.service';

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
    ServerTracingModule.forRoot(environment.tracingConfig)
  ],
  controllers: [AppController],
  providers: [
    {
      provide: SubscriptionService.CONSUMER_SUBSCRIPTION_SERVICE_TOKEN,
      useValue: get(process.env, 'CONSUMER_SUBSCRIPTION_SERVICE_CLUSTER', environment.consumerSubscriptionService)
    },
    {
      provide: FileManagerService.OSDU_FILE_MANAGER_URL_TOKEN,
      useValue: get(process.env, 'OSDU_FILE_MANAGER_CLUSTER', environment.osduFileManagerUrl)
    },
    FileManagerService,
    AppHealthService,
    SubscriptionService
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        cookieParser(),
        ServerRequestContextMiddleware,
        JwtTokenValidationMiddleware({
          production: environment.production,
          jwksUri: process.env.AUTH_JWK_URI,
          verifyOptions: {
            audience: process.env.AUTH_CLIENT_ID
          }
        }),
        RequestValidationMiddleware('content-server', process.env, ['/api/content/health'])
      )
      .exclude('api/content/health')
      .forRoutes('*');
  }
}
