import { Module } from '@nestjs/common';

import { processEnvProvider } from './process-env.provider';
import { configProvider } from './config-provider/config.provider';

/**
 * Exports `configProvider` which should provide all the needed app configuration.
 *
 * Usage example `@Inject(CONFIG_TOKEN) private _appConfig: Config`.
 */
@Module({
  providers: [processEnvProvider, configProvider],
  exports: [configProvider]
})
export class ConfigModule {}
