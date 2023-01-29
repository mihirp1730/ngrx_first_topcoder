export const environment = {
  production: true,
  tracingConfig: {
    metricsInterval: Number(process.env.METRICS_INTERVAL),
    metricsPort: Number(process.env.METRICS_PORT),
    spanProcessorHost: process.env.SPAN_PROCESSOR_HOST,
    spanProcessorPort: Number(process.env.SPAN_PROCESSOR_PORT),
    serviceName: process.env.STORAGE_SERVER_NAME
  }
};
