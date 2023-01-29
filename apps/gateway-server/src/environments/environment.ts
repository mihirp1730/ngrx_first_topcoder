import { join } from 'path';

import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: false,
  consumerDataSourceTypes: {
    type: 'http',
    apiUrl: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/consumer',
    apiPort: '8080'
  },
  venderDataSourceTypes: {
    type: 'in-memory',
    count: 100
  },
  tracingConfig: {
    metricsInterval: 5000,
    metricsPort: 9090,
    spanProcessorHost: 'http://localhost',
    spanProcessorPort: 9411,
    serviceName: 'gateway-server',
    isDev: true
  },
  opportunityAttendeeGrpcDetails: {
    grpcHost: 'localhost',
    grpcPort: '3000',
    protoPath: join(__dirname, 'assets', 'proto', 'opportunity-resource.proto')
  },
  opportunityHostConfig: {
    hostBaseUrl: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com'
  }
};
