export const environment = {
  production: true,
  consumerSubscriptionService: `${process.env.CONSUMER_SUBSCRIPTION_SERVICE_CLUSTER}/consumer`,
  osduFileManagerUrl: `${process.env.OSDU_FILE_MANAGER_CLUSTER}/file-manager`,
  tracingConfig:  {
    metricsInterval: Number(process.env.METRICS_INTERVAL),
    metricsPort: Number(process.env.METRICS_PORT),
    spanProcessorHost: process.env.SPAN_PROCESSOR_HOST,
    spanProcessorPort: Number(process.env.SPAN_PROCESSOR_PORT),
    serviceName: process.env.CONTENT_SERVER_NAME
  }
};
