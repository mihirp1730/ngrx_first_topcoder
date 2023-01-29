import { DynamicModule, Module } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import * as process from 'process';

import { ITracingConfig } from '@apollo/api/interfaces';
import { Tracer } from './server-tracer';

@Module({})
export class ServerTracingModule {
  static async forRoot(options: ITracingConfig): Promise<DynamicModule> {
    const tracer = Tracer.build(options);
    // You can also use the shutdown method to gracefully shut down the SDK before process shutdown
    // or on some operating system signal.
    process.on('SIGTERM', () => {
      tracer
        .shutdown()
        .then(
          () => console.log('SDK shut down successfully'),
          (err) => console.log('Error shutting down SDK', err)
        )
        // eslint-disable-next-line no-process-exit
        .finally(() => process.exit(0));
    });

    await tracer.start();

    return {
      module: ServerTracingModule,
      imports: [
        OpenTelemetryModule.forRoot({
          metrics: {
            hostMetrics: true, // Includes Host Metrics
            apiMetrics: {
              enable: true // Includes api metrics
            }
          }
        })
      ]
    };
  }
}
