import * as grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { HttpService } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';
import { existsSync } from 'fs';

import { ServerOpportunityAttendeeController } from './controller/server-opportunity-attendee.controller';
import { GrpcDetails } from './interfaces/interface';
import * as dataSourceProvider from './providers/data-source';
import { ServerOpportunityAttendeeService } from './services/server-opportunity-attendee.service';

export interface ServerOpportunityAttendeeModuleOptions {
  dataSourceType: GrpcDetails;
}

@Module({
  controllers: [ServerOpportunityAttendeeController],
  providers: [ServerOpportunityAttendeeService],
  exports: [ServerOpportunityAttendeeService]
})
export class ServerOpportunityAttendeeModule {
  static forRoot(options: ServerOpportunityAttendeeModuleOptions): DynamicModule {
    return {
      module: ServerOpportunityAttendeeModule,
      providers: [
        {
          provide: dataSourceProvider.BaseDataSource,
          useFactory: () => ServerOpportunityAttendeeModule.ProvideBaseDataSource(options.dataSourceType)
        }
      ]
    };
  }

  /* istanbul ignore next */
  static async ProvideBaseDataSource(options: GrpcDetails): Promise<dataSourceProvider.BaseDataSource> {
    const dataSource: dataSourceProvider.BaseDataSource = new dataSourceProvider.GrpcDataSource(
      options.grpcHost,
      options.grpcPort,
      options.protoPath,
      () => existsSync,
      () => loadSync,
      () => grpc.loadPackageDefinition,
      new HttpService()
    );

    return await dataSource.init();
  }
}
