import { EnvironmentService } from '@apollo/app/environment';

import { Env, Environment } from './environment.interface';

const local: { key: string; value: string }[] = [
  { key: 'APP_AUTH_SERVICE', value: 'https://localhost:4200/api/auth' },
  { key: 'DELFI_GUI_BASE_URL', value: 'https://p4d.delfi.cloud.slb-ds.com/delfi-components/v1' },
  { key: 'APP_COMMON_FILE_MANAGER_URL', value: 'https://localhost:4200/api-to-proxy/file-manager/files' },
  { key: 'MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL', value: 'https://localhost:4200/api-to-proxy/file-manager/files/download' },
  { key: 'APP_OSDU_FILE_MANAGER_URL', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/file-manager/data-files' },
  { key: 'APP_METADATA_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/metadata' },
  { key: 'APP_BASE_URL', value: 'https://localhost:4200/api-to-proxy' },
  { key: 'APP_DATA_PACKAGES_SERVICE', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/data-packages' },
  { key: 'APP_DATA_SUBSCRIPTION_SERVICE', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/vendor' },
  { key: 'ANALYTICS_MEASUREMENT_ID_VENDOR', value: '' },
  { key: 'APP_OPPORTUNITY_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/host/opportunities' },
  { key: 'APP_OPPORTUNITY_SUBSCRIPTION_SERVICE', value: 'https://localhost:4200/api-to-proxy/host/opportunity-subscriptions' },
  { key: 'APP_OPPORTUNITY_SUBSCRIPTION_REQUEST', value: 'https://localhost:4200/api-to-proxy/host/opportunity-subscription-request' },
  { key: 'AUTH_TIMEOUT_INTERVAL', value: '15' },
  { key: 'APP_COMMUNICATION_SERVICE', value: 'https://localhost:4200/api-to-proxy/chat/threads' },
  { key: 'APP_COMMUNICATION_WS_URL', value: 'wss://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/communication' },
  { key: 'APP_OPPORTUNITY_MAP_SERVICE', value: 'https://localhost:4200/api-to-proxy/host/opportunities' },
  { key: 'APP_OPPORTUNITY_ATTENDEE_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/attendee/opportunities' },
  { key: 'APP_CCM_SERVICE_HOST', value: 'https://api.evq.csp.slb.com/ccm' },
  { key: 'DELFI_PORTAL_APP', value: 'https://p4d.delfi.cloud.slb-ds.com/' },
  { key: 'AT_APP_CODE', value: 'assettransactionportal' },
  { key: 'APP_TRAFFIC_MANAGER_URL_VENDOR', value: 'https://p4d.csi.cloud.slb-ds.com/api/v2/routes/local-4200-https' },
  { key: 'APP_TRAFFIC_ERROR_REDIRECT', value: 'https://p4d.delfi.cloud.slb-ds.com/' },
  { key: 'APP_TRAFFIC_MANAGER_IS_ENABLED', value: 'false' },
  {
    key: 'TM_CONSUMER_DETAILS',
    value:
      "[{ 'consumerURL': 'localhost', 'trafficManagerCode': 'local-4200-https' },{ 'consumerURL': 'evd.gaia-osdu.gaiaops.cloud.slb-ds.com', 'trafficManagerCode': 'asset-transaction-evd-map' },{ 'consumerURL': 'vd8.evq.gaia-osdu.gaiaops.cloud.slb-ds.com', 'trafficManagerCode': 'vd8-asset-transaction-evd-map' }]"
  }
];

// Replace environment variables with local values
export const environment: Environment = EnvironmentService.getEnvironment('/environments/environment.json', local);

export const env: Env = {
  production: false
};
