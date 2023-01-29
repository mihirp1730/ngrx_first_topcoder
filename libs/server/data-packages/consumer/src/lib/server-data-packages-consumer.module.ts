import { ServerRequestContextModule, ServerRequestContextService } from '@apollo/server/request-context';
import { HttpModule, HttpService } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { ServerDataPackagesConsumerController } from './controllers/server-data-packages-consumer.controller';
import * as consumerDataSourceProvider from './providers/consumer-data-source';
import { ServerDataPackagesConsumerService } from './services/server-data-packages-consumer.service';
import * as tokens from './tokens';
import { DataSourceTypes } from './types';

export interface ServerDataPackagesConsumerModuleOptions {
  dataSourceType: DataSourceTypes;
}

@Module({
  controllers: [ServerDataPackagesConsumerController],
  providers: [ServerDataPackagesConsumerService]
})
export class ServerDataPackagesConsumerModule {
  /* istanbul ignore next */
  static forRoot(options: ServerDataPackagesConsumerModuleOptions): DynamicModule {
    return {
      module: ServerDataPackagesConsumerModule,
      imports: [HttpModule, ServerRequestContextModule],
      providers: [
        {
          provide: tokens.SERVICE_CONSUMER_DATA_SOURCE_TOKEN,
          useValue: options.dataSourceType
        },
        {
          provide: consumerDataSourceProvider.BaseConsumerDataSource,
          inject: [tokens.SERVICE_CONSUMER_DATA_SOURCE_TOKEN, HttpService, ServerRequestContextService],
          useFactory: ServerDataPackagesConsumerModule.ProvideBaseDataSource
        }
      ]
    };
  }

  /* istanbul ignore next */
  static async ProvideBaseDataSource(
    dataSourceType: DataSourceTypes,
    httpService: HttpService,
    serverRequestContextService: ServerRequestContextService
  ): Promise<consumerDataSourceProvider.BaseConsumerDataSource> {
    let dataSource: consumerDataSourceProvider.BaseConsumerDataSource;
    switch (dataSourceType.type) {
      case 'http': {
        dataSource = new consumerDataSourceProvider.HttpConsumerDataSource(
          dataSourceType.apiUrl,
          dataSourceType.apiPort,
          httpService,
          serverRequestContextService
        );
        break;
      }
      case 'in-memory': {
        dataSource = new consumerDataSourceProvider.InMemoryConsumerDataSource();
        break;
      }
    }
    return dataSource.init();
  }
}
