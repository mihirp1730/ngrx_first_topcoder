import { ITracingConfig } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { ConfigBase, LogStorage, SessionStorage } from './config.base';

@Injectable()
@GaiaTraceClass
export class EnvConfig extends ConfigBase {

  constructor(private readonly processEnv: NodeJS.ProcessEnv){
    super();
  }

  public async isDeployed(): Promise<boolean> {
    return true;
  }

  public async logStorage(): Promise<LogStorage> {
    return {
      type: this.getProcessEnvValueOrNull('LOGSTORAGE_TYPE')
    };
  }

  public async sessionStorage(): Promise<SessionStorage> {
    const componentsFromEnv = this.getProcessEnvValueOrNull('SESSIONSTORAGE_DEFAULT_USER_SESSION_COMPONENTS');
    return {
      defaultUserSession: {
        // turn the config string (i.e. "map,threedviz,twodviz") into an array
        // that our factory can respond to.
        components: componentsFromEnv !== null
          ? componentsFromEnv.split(',').map((id) => ({id} as any))
          : [],
        id: this.getProcessEnvValueOrNull('SESSIONSTORAGE_DEFAULT_USER_SESSION_ID'),
        name: this.getProcessEnvValueOrNull('SESSIONSTORAGE_DEFAULT_USER_SESSION_NAME'),
        user: this.getProcessEnvValueOrNull('SESSIONSTORAGE_DEFAULT_USER_SESSION_USER'),
      },
      type: this.getProcessEnvValueOrNull('SESSIONSTORAGE_TYPE')
    };
  }

  public getTracingConfig(): ITracingConfig {
    return {
      metricsInterval: Number(this.processEnv.METRICS_INTERVAL),
      metricsPort: Number(this.processEnv.METRICS_PORT),
      spanProcessorHost: this.processEnv.SPAN_PROCESSOR_HOST,
      spanProcessorPort: Number(this.processEnv.SPAN_PROCESSOR_PORT),
      serviceName: this.processEnv.SESSION_SERVER_CONFIG_LOGGER_SERVICE_NAME
    }
  }

  private getProcessEnvValueOrNull(value: string): string {
    const key = `SESSION_SERVER_CONFIG_${value}`;
    if (this.processEnv[key] === undefined) {
      return null;
    }
    return this.processEnv[key];
  }
}
