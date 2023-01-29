import { ITracingConfig } from '@apollo/api/interfaces';

/**
 * App configuration structure.
 */
export interface Config {

  /** Port where proxy (the app) listens. */
  appPort: number;
  /** URL global prefix where all calls are proxified. Should default to "" as specified on `getEnvVars()`. */
  appUrlPrefix: string;
  isProduction: boolean;

  correctAccountNames: string[];
  authServiceTokenHost: string | null;
  validationCacheExpiration: number | null;

  /** CCM service host endpoint. Used on Account validator. */
  ccmServiceHost: string | null;
  /** CCM service key for this app. */
  ccmAppKey: string | null;
  /** CCM app code identifier for this app. Used on Account validator when requesting User Subscriptions. */
  ccmAppCode: string | null;
  /** Part numbers to check from the User Subscriptions products for the validation to pass. Used on Account validator. */
  ccmPartNumbers: string[];

  enableCsrfProtection: boolean;
  enableCsrfSecure: boolean;

  /** Issuer string for verification of TM JWT tokens. */
  trafficManagerIssuer: string | null;
  /** URL for verification and signage of JWT tokens. Currently only used for TM JWT tokens. */
  trafficManagerJwksUri: string | null;

  /** URL for sauth v2 */
  sauthUrl: string | null;
  /** URL for sauth to redirect */
  redirectUri: string | null;
  /** Client ID registed in delfi developer portal */
  clientId: string | null;
  /** Credentials generated from delfi developer portal */
  clientSecret: string | null;
  /** URL for get token by code */
  tokenServiceUrl: string | null;
  /** URL for redirect after log out */
  postLogoutRedirectUri: string | null;
  /** Region identifier for subscriptions list */
  regionIdentifier: string;
  /** Client Ids in scope for SAuth token  */
  tokenAudience: string;

  /** These credentials are used to generate tokens for guest / unauthenticated users. **/
  guestClientId: string | null;
  guestClientSecret: string | null;

  /** Auth token timeout interval */
  timeoutInterval: number;

  /** Flag for dev environment */
  enableGuestLogin: boolean;

  /** Tracing */
  tracingConfig: ITracingConfig;
  gisClientId: string;
}
