/* istanbul ignore next */
import { Logger, Module } from '@nestjs/common';

import { BaseConfig } from './base.config';
import { EnvConfig } from './env.config';
import { LocalConfig } from './local.config';

export const ConfigFactory = (process: NodeJS.Process, logger: Logger): BaseConfig => {
  if (process.env.METADATA_SERVER_DEPLOY === 'true') {
    return new EnvConfig(process, logger);
  } else {
    return new LocalConfig(process);
  }
};

@Module({
  providers: [
    {
      provide: 'process',
      useValue: process
    },
    {
      provide: 'logger',
      useValue: Logger
    },
    {
      provide: BaseConfig,
      inject: ['process', 'logger'],
      useFactory: ConfigModule.BaseConfigFactory
    }
  ],
  exports: [BaseConfig]
})
export class ConfigModule {
  static async BaseConfigFactory(process: NodeJS.Process, logger: Logger): Promise<BaseConfig> {
    return ConfigFactory(process, logger);
  }
}
