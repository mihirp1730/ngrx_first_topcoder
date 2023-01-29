import { Module } from '@nestjs/common';

import { BaseConfig } from './base.config';
import { EnvConfig } from './env.config';
import { LocalConfig } from './local.config';

export const ConfigFactory = (process: NodeJS.Process): BaseConfig => { 
  if (process.env.STORAGE_SERVER_DEPLOY === 'true') {
    return new EnvConfig(process);
  } else {
    return new LocalConfig(process);
  }
}

@Module({
  providers: [
    {
      provide: 'process',
      useValue: process
    },
    {
      provide: BaseConfig,
      inject: ['process'],
      useFactory: ConfigModule.BaseConfigFactory
    }
  ],
  exports: [BaseConfig]
})
export class ConfigModule {
  static async BaseConfigFactory(process: NodeJS.Process): Promise<BaseConfig> {
    return ConfigFactory(process);
  }
}
