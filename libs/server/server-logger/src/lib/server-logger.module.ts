import { DynamicModule, Module } from '@nestjs/common';
import { noop } from 'lodash';
import { LoggerModule } from 'nestjs-pino';
import pino from 'pino';

type LoggerModuleOptions = {
  redactPaths: string[];
  logPath?: string;
  addSeverity: boolean;
  production: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formatter?: (object: any) => any;
};

const SeverityLookup = {
  default: 'DEFAULT',
  silly: 'DEFAULT',
  verbose: 'DEBUG',
  debug: 'DEBUG',
  http: 'notice',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR'
};

const logLevels = ['log', 'debug', 'error', 'warn'];

const createLoggerOptions = (options: LoggerModuleOptions) => {
  let logFormatters = {};
  if (options.formatter) {
    logFormatters = logLevels.reduce(
      // eslint-disable-next-line @typescript-eslint/ban-types
      (acc, method): Object => ({
        ...acc,
        [method]: options.formatter
      }),
      {}
    );
  }

  const levelFormatters = {
    level: (label: string, level: number) => {
      const log = { level };
      if (!options.addSeverity) {
        return log;
      }
      return {
        severity: SeverityLookup[label] || SeverityLookup['info'],
        ...log
      };
    }
  };

  return {
    formatters: {
      ...logFormatters,
      ...levelFormatters
    },
    base: undefined,
    redact: {
      paths: options.redactPaths,
      remove: true
    }
  };
};

@Module({})
export class ServerLoggerModule {
  /* istanbul ignore next */
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    // By default, do not log anything, anywhere:
    let output = { write: noop };
    // If we're in a production environment, use an actual logger:
    if (options.production) {
      output = options.logPath ? pino.destination(options.logPath) : process.stdout;
    }
    return {
      module: ServerLoggerModule,
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            logger: pino(createLoggerOptions(options), output)
          }
        })
      ]
    };
  }
}
