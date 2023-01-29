export class ITracingConfig {
    metricsInterval: number;
    metricsPort: number;
    spanProcessorHost: string;
    spanProcessorPort: number;
    serviceName: string;
    isDev?: boolean;
}
  