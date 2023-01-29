import { AppHealthService } from '@apollo/app/health';
import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { ServerDataPackagesConsumerModule } from '@apollo/server/data-packages/consumer';
import { ServerDataPackagesVendorModule } from '@apollo/server/data-packages/vendor';
import { JwtTokenValidationMiddleware } from '@apollo/server/jwt-token-validation-middleware';
import { ServerOpportunityAttendeeModule } from '@apollo/server/opportunity/attendee';
import { ServerOpportunityHostModule } from '@apollo/server/opportunity/host';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { RequestValidationMiddleware } from '@apollo/server/request-validation-middleware';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { environment } from '../environments/environment';
import { GatewayController } from './controllers/gateway.controller';
import { GatewayService } from './services/gateway.service';

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
    ServerTracingModule.forRoot(environment.tracingConfig),
    ServerDataPackagesConsumerModule.forRoot({
      dataSourceType: environment.consumerDataSourceTypes
    }),
    ServerDataPackagesVendorModule.forRoot({
      dataSourceType: environment.venderDataSourceTypes
    }),
    ServerOpportunityAttendeeModule.forRoot({
      dataSourceType: environment.opportunityAttendeeGrpcDetails
    }),
    ServerOpportunityHostModule.forRoot({
      config: environment.opportunityHostConfig
    })
  ],
  controllers: [GatewayController],
  providers: [GatewayService, AppHealthService]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
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
        RequestValidationMiddleware('gateway-server', process.env, ['/api/gateway/health'])
      )
      .exclude('api/gateway/health')
  }
}
