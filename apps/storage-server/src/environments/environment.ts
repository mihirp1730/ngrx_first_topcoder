export const environment = {
  production: false,
  tracingConfig: {
    metricsInterval: 5000,
    metricsPort: 9090,
    spanProcessorHost: 'http://localhost',
    spanProcessorPort: 9411,
    serviceName: 'storage-server',
    isDev: true
  }
};
