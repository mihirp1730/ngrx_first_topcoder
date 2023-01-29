import { AuthConfig, DelfiGuiAuthConfig } from '@apollo/api/interfaces';

export interface Environment {
  api: {
    metadata: string;
    settings: string;
    session: string;
    appBaseUrl: string;
    dataPackages: string;
    consumerSubscriptions: string;
    dataSubscription: string;
    content: string;
    commonFileManager: string;
    opportunityAttendee: string;
    communication: string;
    wsCommunicationUrl: string;
    opportunitySubscriptionRequest: string;
    opportunityGatewayAttendee: string;
    opportunityRequestsAttendee: string;
    opportunitySubscriptionsAttendee: string;
    multipleFileDownload: string;
    hostAppUrl: string;
  };
  trafficManagerConfig: TrafficManagerConfig[];
  trafficManager: {
    errorRedirect: string;
    trafficManagerUrl: string;
    isEnabled: string;
  };
  authConfig: AuthConfig;
  delfiGuiAuthConfig: DelfiGuiAuthConfig;
  measurementId: string;
  enableGuestLogin: string;
  whitelistedGuestList: string;
}

export interface Env {
  production: boolean;
}

export interface TrafficManagerConfig {
  consumerURL: string;
  trafficManagerCode: string;
}
