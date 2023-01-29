import { DynamicModule, Module } from '@nestjs/common';

import { FeatureFlagService } from './feature-flag.service';

@Module({
  controllers: [],
  providers: [],
  exports: []
})
export class ServerFeatureFlagModule {
  static forRoot(config: { splitioNodejsKey: string }): DynamicModule {
    return {
      module: ServerFeatureFlagModule,
      providers: [
        {
          provide: FeatureFlagService,
          useFactory: () => {
            return new FeatureFlagService(config.splitioNodejsKey);
          }
        }
      ],
      exports: [FeatureFlagService]
    };
  }
}
