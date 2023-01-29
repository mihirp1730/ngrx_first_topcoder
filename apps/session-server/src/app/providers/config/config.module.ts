import { Module } from '@nestjs/common';

import { ConfigBase } from './config.base';
import { EnvConfig } from './env.config';
import { LocalConfig } from './local.config';

export const ConfigFactory = (process: NodeJS.Process): ConfigBase => { 
  if (process.env.SESSION_SERVER_DEPLOYED !== undefined) {
    return new EnvConfig(process.env);
  }
  return new LocalConfig();
}

@Module({
  providers: [
    {
      provide: 'process',
      useValue: process
    },
    {
      provide: ConfigBase,
      inject: ['process'],
      useFactory: ConfigModule.BaseConfigFactory
    }
  ],
  exports: [ConfigBase]
})
export class ConfigModule {
  static async BaseConfigFactory(process: NodeJS.Process): Promise<ConfigBase> {
    return ConfigFactory(process);
  }
}
