import { join } from 'path';
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: true,
  consumerDataSourceTypes: {
    type: 'http',
    apiUrl: process.env.CONSUMER_SUBSCRIPTION_SERVICE_CLUSTER,
    apiPort: process.env.METADATA_SERVICE_PORT
  },
  venderDataSourceTypes: {
    type: 'grpc',
    grpcHost: process.env.GATEWAY_SERVER_DATA_SOURCE_TYPE_GRPC_HOST,
    grpcPort: process.env.GATEWAY_SERVER_DATA_SOURCE_TYPE_GRPC_PORT,
    protoPath: join(__dirname, 'assets', 'proto', 'data-package-resource.proto')
  },
  tracingConfig: {
    metricsInterval: Number(process.env.METRICS_INTERVAL),
    metricsPort: Number(process.env.METRICS_PORT),
    spanProcessorHost: process.env.SPAN_PROCESSOR_HOST,
    spanProcessorPort: Number(process.env.SPAN_PROCESSOR_PORT),
    serviceName: process.env.GATEWAY_SERVER_NAME
  },
  opportunityAttendeeGrpcDetails: {
    grpcHost: process.env.GATEWAY_SERVER_OPPORTUNITY_GRPC_HOST,
    grpcPort: process.env.GATEWAY_SERVER_OPPORTUNITY_GRPC_PORT,
    protoPath: join(__dirname, 'assets', 'proto', 'opportunity-resource.proto')
  },
  opportunityHostConfig: {
    hostBaseUrl: process.env.DATA_SUBSCRIPTION_SERVICE_CLUSTER
  }
};
