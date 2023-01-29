import { HttpModule, HttpService } from '@nestjs/axios';
import { DynamicModule, Module } from '@nestjs/common';

import { ServerOpportunityHostController } from './controller/server-opportunity-host.controller';
import { IOpportunityHostRequestConfig, ServerOpportunityHostModuleOptions } from './interfaces/interface';
import { BaseDataSource } from './providers/base.data-source';
import { HttpBaseDataSource } from './providers/http.base.data-source';
import { ServerOpportunityHostService } from './services/server-opportunity-host.service';

export const SERVICE_CONSUMER_DATA_SOURCE_TOKEN = Symbol('SERVICE_CONSUMER_DATA_SOURCE_TOKEN');
@Module({
  imports: [HttpModule],
  controllers: [ServerOpportunityHostController],
  providers: [ServerOpportunityHostService],
  exports: [ServerOpportunityHostService]
})
export class ServerOpportunityHostModule {
  static forRoot(options: ServerOpportunityHostModuleOptions): DynamicModule {
    return {
      module: ServerOpportunityHostModule,
      imports: [HttpModule],
      providers: [
        {
          provide: BaseDataSource,
          useFactory: () => ServerOpportunityHostModule.ProvideBaseDataSource(options.config)
        }
      ]
    };
  }

  static async ProvideBaseDataSource(config: IOpportunityHostRequestConfig): Promise<BaseDataSource> {
    const dataSource = new HttpBaseDataSource(config, new HttpService());
    return await dataSource.init();
  }
}
