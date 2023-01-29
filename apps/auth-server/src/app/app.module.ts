import { AppHealthService } from '@apollo/app/health';
import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { ServerFeatureFlagModule } from '@apollo/server/feature-flag';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Inject, Logger, MiddlewareConsumer, Module, NestModule, Type } from '@nestjs/common';
import { hidePoweredBy, injectHeadersMiddlewere } from '@slb-delfi-exploration/dd-infrastructure';
import * as cookieParser from 'cookie-parser';
import * as csrf from 'csurf';

import { environment } from '../environments/environment';
import { AppController } from './app.controller';
import { Config, ConfigModule, CONFIG_TOKEN } from './modules/config';
import { getConfig } from './modules/config/config-provider/get-config';
import { AccountValidatorService, nodeCacheProvider, TrafficManagerJwtTokenValidatorService } from './providers';
import { AccountValidatorDataService } from './providers/account/account-validator-data.service';
import { ProxyService } from './providers/proxy';

@Module({
  imports: [
    HttpModule,
    ServerAspectLoggerModule.forRoot({
      logger: new Logger('ASPECT LOGGER'),
      production: environment.production
    }),
    ServerFeatureFlagModule.forRoot({
      splitioNodejsKey: process.env.SPLITIO_NODEJS_KEY || 'localhost'
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
    ServerTracingModule.forRoot(getConfig(process.env).tracingConfig),
    ConfigModule
  ],
  controllers: [AppController],
  providers: [
    nodeCacheProvider,
    AppHealthService,
    AccountValidatorService,
    AccountValidatorDataService,
    TrafficManagerJwtTokenValidatorService,
    ProxyService,
    Logger
  ]
})
export class AppModule implements NestModule {
  constructor(@Inject(CONFIG_TOKEN) private _appConfig: Config) {}

  /**
   * Configures app middlewares.
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(...this._getRootMiddlewares()).forRoutes('*');
    consumer.apply(JwtTokenMiddleware).forRoutes('api/auth/traffic-validate');
  }

  // Middleware configuration helper methods. =========================================================================

  /**
   * Returns a list with the following Middlewares:
   * - CSRF
   * - Request context
   * - Hide powered-by header
   * - Custom headers
   * - Authentication
   */
  private _getRootMiddlewares(): (any | Type<any>)[] {
    const middlewares: (any | Type<any>)[] = [];

    // CSRF
    if (this._appConfig.enableCsrfProtection) {
      middlewares.push(cookieParser());
      middlewares.push(csrf({ cookie: { key: '_csrf', secure: this._appConfig.enableCsrfSecure } }));
    }

    // Capture request context.
    middlewares.push(ServerRequestContextMiddleware);

    // Hide powered-by header.
    middlewares.push(hidePoweredBy());

    // Custom headers.
    middlewares.push(
      injectHeadersMiddlewere({
        'Cache-Control': 'no-cache, no-store',
        Expires: new Date(Date.now()).toUTCString(),
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'sameorigin',
        'X-XSS-Protection': '1; mode=block'
      })
    );

    return middlewares;
  }
}
