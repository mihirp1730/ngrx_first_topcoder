import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { DynamicModule, Module } from '@nestjs/common';
import { existsSync } from 'fs';

import { ServerDataPackagesVendorController } from './controllers/server-data-packages-vendor.controller';
import * as dataSourceProvider from './providers/data-source';
import { ServerDataPackagesVendorService } from './services/server-data-packages-vendor.service';
import * as tokens from './tokens';
import { DataSourceTypes } from './types';

export interface ServerDataPackagesVendorModuleOptions {
  dataSourceType: DataSourceTypes;
}

@Module({
  controllers: [ServerDataPackagesVendorController],
  providers: [ServerDataPackagesVendorService]
})
export class ServerDataPackagesVendorModule {
  static forRoot(options: ServerDataPackagesVendorModuleOptions): DynamicModule {
    return {
      module: ServerDataPackagesVendorModule,
      providers: [
        {
          provide: tokens.SERVICE_DATA_SOURCE_TOKEN,
          useValue: options.dataSourceType
        },
        {
          provide: dataSourceProvider.BaseDataSource,
          inject: [tokens.SERVICE_DATA_SOURCE_TOKEN],
          useFactory: ServerDataPackagesVendorModule.ProvideBaseDataSource
        }
      ]
    };
  }

  /* istanbul ignore next */
  static async ProvideBaseDataSource(
    dataSourceType: DataSourceTypes
  ): Promise<dataSourceProvider.BaseDataSource> {
    let dataSource: dataSourceProvider.BaseDataSource;
    switch (dataSourceType.type) {
      case 'grpc': {
        dataSource = new dataSourceProvider.GrpcDataSource(
          dataSourceType.grpcHost,
          dataSourceType.grpcPort,
          dataSourceType.protoPath,
          () => existsSync,
          () => loadSync,
          () => grpc.loadPackageDefinition,
          dataSourceType.grpcOptions
        );
        break;
      }
      case 'in-memory': {
        dataSource = new dataSourceProvider.InMemoryDataSource(
          dataSourceType.count
        );
        break;
      }
    }
    return await dataSource.init();
  }
}
