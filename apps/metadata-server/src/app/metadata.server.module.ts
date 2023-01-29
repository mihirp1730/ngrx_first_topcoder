import { ServerAspectLoggerModule } from '@apollo/server/aspect-logger';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { ServerRequestContextMiddleware, ServerRequestContextModule } from '@apollo/server/request-context';
import { DatabaseMiddleware } from './middleware/database-connection';

import { RequestValidationMiddleware } from '@apollo/server/request-validation-middleware';
import { ServerLoggerModule } from '@apollo/server/server-logger';
import { ServerTracingModule, traceLogFormatter } from '@apollo/tracer';
import { HttpModule } from '@nestjs/axios';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { TypeOrmModule } from '@nestjs/typeorm';
import { environment } from '../environments/environment';
import { BaseConfig } from './config/base.config';
import { ConfigFactory, ConfigModule } from './config/config.module';
import { MetadataLayerModule } from './layer-metadata/layer-metadata.module';
import { LayerSettingModule } from './layer-setting/layer-setting.module';

@Module({
  imports: [
    ConfigModule,
    ServerAspectLoggerModule.forRoot({
      logger: new Logger('ASPECT LOGGER'),
      production: environment.production
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
    ServerTracingModule.forRoot(ConfigFactory(process, new Logger('ASPECT LOGGER')).getTracingConfig()),
    ServerRequestContextModule,
    MetadataLayerModule,
    LayerSettingModule,
    HttpModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (baseConfig: BaseConfig) => {
        const { port, username, password, database } = await baseConfig.getTypeORMConfig();
        return {
          type: 'postgres',
          host: 'localhost',
          port,
          username,
          password,
          database,
          entities: [],
          autoLoadEntities: true
        };
      },
      inject: [BaseConfig]
    })
  ]
})
export class MetadataServerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieParser(),
        ServerRequestContextMiddleware,
        JwtTokenMiddleware,
        DatabaseMiddleware,
        RequestValidationMiddleware('metadata-server', process.env, ['/api/metadata/health'])
      )
      .exclude('api/metadata/health')
      .forRoutes('*');
  }
}
