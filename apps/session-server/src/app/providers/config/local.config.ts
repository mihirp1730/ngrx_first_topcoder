import { ITracingConfig } from '@apollo/api/interfaces';
import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable } from '@nestjs/common';

import { ConfigBase, LogStorage, SessionStorage } from './config.base';

@Injectable()
@GaiaTraceClass
export class LocalConfig extends ConfigBase {

  public async isDeployed(): Promise<boolean> {
    return false;
  }

  public async logStorage(): Promise<LogStorage> {
    return {
      type: 'console'
    };
  }

  public async sessionStorage(): Promise<SessionStorage> {
    const components: any = [
      {id: 'map'}
    ];
    return {
      defaultUserSession: {
        components,
        id: null,
        name: null,
        user: null,
      },
      type: 'memory'
    };
  }

  public getTracingConfig(): ITracingConfig {
    return {
      metricsInterval: 5000,
      metricsPort: 9090,
      spanProcessorHost: 'http://localhost',
      spanProcessorPort: 9411,
      serviceName: 'session-server',
      isDev: true
    }
  }
}
