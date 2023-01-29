import { Provider } from '@nestjs/common';

import { PROCESS_ENV_TOKEN } from '../process-env.provider';
import { getConfig } from './get-config';
import { Config } from './config.interface';

/** Token for providing `configProvider`. */
export const CONFIG_TOKEN = Symbol('app config provider token');

/**
 * Provides the app `Config` configuration.
 *
 * Depends of `PROCESS_ENV_TOKEN` to read the `process.env` value.
 */
export const configProvider: Provider<Config> = {
  provide: CONFIG_TOKEN,
  useFactory: getConfig,
  inject: [PROCESS_ENV_TOKEN]
};
