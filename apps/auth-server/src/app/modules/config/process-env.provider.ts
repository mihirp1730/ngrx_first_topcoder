import { Provider } from '@nestjs/common';

/** Token for providing `process.env`. */
export const PROCESS_ENV_TOKEN = Symbol('app process.env provider token');

/** Provides `process.env` value. */
export const processEnvProvider: Provider<NodeJS.ProcessEnv> = {
  provide: PROCESS_ENV_TOKEN,
  useValue: process.env
};
