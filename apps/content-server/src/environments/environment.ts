export const environment = {
  production: false,
  consumerSubscriptionService: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/consumer',
  osduFileManagerUrl: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/file-manager',
  tracingConfig:  {
    metricsInterval: Number(process.env.METRICS_INTERVAL) || 5000,
    metricsPort: Number(process.env.METRICS_PORT) || 9090,
    spanProcessorHost: process.env.SPAN_PROCESSOR_HOST || 'http://localhost',
    spanProcessorPort: Number(process.env.SPAN_PROCESSOR_PORT) || 9411,
    serviceName: process.env.CONTENT_SERVER_NAME || "content-server",
    isDev: true
  }
}