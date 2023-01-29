import { EnvironmentService } from '@apollo/app/environment';

import { Env, Environment } from './environment.interface';

const local: { key: string; value: string }[] = [
  { key: 'APP_AUTH_SERVICE', value: 'https://localhost:4200/api/auth' },
  { key: 'APP_METADATA_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/metadata' },
  { key: 'APP_SESSION_SERVICE', value: 'https://localhost:4200/api/session' },
  { key: 'APP_TRAFFIC_MANAGER_URL_CONSUMER', value: 'https://p4d.csi.cloud.slb-ds.com/api/v2/routes/' },
  { key: 'APP_TRAFFIC_ERROR_REDIRECT', value: 'https://p4d.delfi.cloud.slb-ds.com/' },
  { key: 'APP_CONTENT_SERVICE', value: 'https://localhost:4200/api/content' },
  { key: 'APP_TRAFFIC_MANAGER_IS_ENABLED', value: 'false' },
  { key: 'DELFI_GUI_BASE_URL', value: 'https://p4d.delfi.cloud.slb-ds.com/delfi-components/v1' },
  { key: 'APP_BASE_URL', value: 'https://localhost:4200' },
  { key: 'APP_DATA_PACKAGES_SERVICE', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/data-packages' },
  { key: 'APP_CONSUMER_SUBSCRIPTION_SERVICE', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/consumer' },
  { key: 'APP_DATA_SUBSCRIPTION_SERVICE', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/vendor' },
  { key: 'ANALYTICS_MEASUREMENT_ID_CONSUMER', value: '' },
  { key: 'APP_COMMON_FILE_MANAGER_URL', value: 'https://localhost:4200/api-to-proxy/file-manager/files' },
  { key: 'AUTH_TIMEOUT_INTERVAL', value: '15' },
  { key: 'APP_OPPORTUNITY_GATEWAY_ATTENDEE_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/gateway/attendee/opportunities' },
  { key: 'APP_OPPORTUNITY_ATTENDEE_SERVICE', value: 'https://localhost:4200/api-to-proxy/api/attendee/opportunities' },
  { key: 'APP_COMMUNICATION_SERVICE', value: 'https://localhost:4200/api-to-proxy/chat/threads' },
  { key: 'APP_COMMUNICATION_WS_URL', value: 'wss://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/communication' },
  {
    key: 'TM_CONSUMER_DETAILS',
    value:
      "[{ 'consumerURL': 'localhost', 'trafficManagerCode': 'local-4200-https' },{ 'consumerURL': 'evd.gaia-osdu.gaiaops.cloud.slb-ds.com', 'trafficManagerCode': 'asset-transaction-evd-map' },{ 'consumerURL': 'vd8.evq.gaia-osdu.gaiaops.cloud.slb-ds.com', 'trafficManagerCode': 'vd8-asset-transaction-evd-map' }]"
  },
  {
    key: 'APP_OPPORTUNITY_SUBSCRIPTION_REQUEST',
    value: 'https://localhost:4200/api-to-proxy/host/opportunity-subscription-request'
  },
  { key: 'APP_OPPORTUNITY_REQUEST_ATTENDEE', value: 'https://localhost:4200/api-to-proxy/attendee/opportunity-subscription-requests' },
  { key: 'APP_OPPORTUNITY_SUBSCRIPTION_ATTENDEE', value: 'https://localhost:4200/api-to-proxy/attendee/opportunity-subscriptions' },
  { key: 'ENABLE_GUEST_LOGIN', value: 'false' },
  { key: 'WHITELISTED_GUEST_LIST', value: '@slb.com' },
  { key: 'MULTIPLE_MEDIA_FILE_DOWNLOAD_API_URL', value: 'https://localhost:4200/api-to-proxy/file-manager/files/download' },
  { key: 'HOST_APP_URL', value: 'https://evd.gaia-osdu.gaiaops.cloud.slb-ds.com/xchange/vendor' }
];

// Replace environment variables with local values
export const environment: Environment = EnvironmentService.getEnvironment('/environments/environment.json', local);

export const env: Env = {
  production: false
};
