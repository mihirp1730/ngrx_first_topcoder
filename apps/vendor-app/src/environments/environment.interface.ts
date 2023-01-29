import { AuthConfig, DelfiGuiAuthConfig } from '@apollo/api/interfaces';

export interface Environment {
  authConfig: AuthConfig;
  delfiGuiAuthConfig: DelfiGuiAuthConfig;
  delfiPortalApp: string;
  assetTransactionAppCode: string;
  api: {
    settings: string;
    commonFileManager: string;
    osduFileManager: string;
    appBaseUrl: string;
    metadata: string;
    dataPackages: string;
    dataSubscription: string;
    opportunity: string;
    opportunitySubscriptions: string;
    communication: string;
    wsCommunicationUrl: string;
    opportunitySubscriptionRequest: string;
    opportunityMapRepresentation: string;
    opportunityAttendee: string;
    appCCMServiceHost: string;
    multipleFileDownload: string;
  };
  trafficManagerConfig: TrafficManagerConfig[];
  trafficManager: {
    errorRedirect: string;
    trafficManagerUrl: string;
    isEnabled: string;
  };
  measurementId: string;
}

export interface Env {
  production: boolean;
}

export interface TrafficManagerConfig {
  consumerURL: string;
  trafficManagerCode: string;
}
