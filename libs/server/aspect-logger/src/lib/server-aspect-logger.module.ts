import { DynamicModule, Module } from '@nestjs/common';
import { noop } from 'lodash';

import { AspectLogger, ILogger } from './aspect-logger';

export interface ServerAspectLoggerModuleOptions {
  logger: ILogger;
  production: boolean;
}

@Module({})
export class ServerAspectLoggerModule {
  /* istanbul ignore next */
  static forRoot(options: ServerAspectLoggerModuleOptions): DynamicModule {
    if (options.production) {
      AspectLogger.logger = options.logger;
    } else {
      AspectLogger.logger = { error: noop, log: noop };
    }
    return { module: ServerAspectLoggerModule };
  }
}
