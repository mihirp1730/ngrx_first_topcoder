/**
 * Gets **all** the used environment variables (properly converted to the intended type)
 * or their default values, as defined here.
 *
 * See `Config` interface on `config.interface.ts` for more details for each of the app configuration properties.
 *
 * See `getConfig()` on `get-config.ts` for details about how computed/calculated config properties are obtained from this
 * environment variables.
 */
export function getEnvVars(env: NodeJS.ProcessEnv) {
  return {
    isDocker: env.AUTH_PROXY_DOCKER === 'true',
    appPort: validateValue(Number(env.AUTH_PROXY_LISTEN_PORT)),
    appUrlPrefix: validateValue(env.AUTH_PROXY_URL_PREFIX, ''), // Not on deployment.yaml

    /**
     * String with possible multiple values separated with `;`. Defaults to null if not defined.
     * Source for the `Config` interface `correctAccountNames` property; see such interface for more details.
     */
    correctAccountName: validateValue(env.AUTH_PROXY_CORRECT_ACCOUNT_NAME),
    authServiceTokenHost: validateValue(env.AUTH_PROXY_TOKEN_HOST),
    validationCacheExpiration: validateValue(Number(env.AUTH_PROXY_AUTHORIZATION_CACHE_EXPIRATION_SEC)),

    ccmServiceHost: validateValue(env.AUTH_PROXY_CCM_SERVICE_HOST),
    ccmAppKey: validateValue(env.AUTH_PROXY_CCM_APP_KEY),
    ccmAppCode: validateValue(env.AUTH_PROXY_CCM_APP_CODE),
    /**
     * String with possible multiple values separated with `;`. Defaults to null if not defined.
     * Source for the `Config` interface `ccmPartNumbers` property; see such interface for more details.
     */
    ccmPartNumber: validateValue(env.AUTH_PROXY_CCM_PART_NUMBER),

    enableCsrfProtection: env.AUTH_PROXY_CSRF_PROTECTION === 'true',
    enableCsrfSecure: env.AUTH_PROXY_CSRF_SECURE === 'true',

    trafficManagerIssuer: validateValue(env.AUTH_PROXY_TRAFFIC_MANAGER_ISSUER),
    trafficManagerJwksUri: validateValue(env.AUTH_PROXY_TRAFFIC_MANAGER_JWKS_URI),

    sauthUrl: validateValue(env.AUTH_PROXY_SAUTH_URL),
    redirectUri: validateValue(env.AUTH_PROXY_REDIRECT_URI),
    clientId: validateValue(env.AUTH_PROXY_CLIENT_ID),
    gisClientId: validateValue(env.GIS_CLIENT_ID),
    clientSecret: validateValue(env.AUTH_PROXY_CLIENT_SECRET),
    tokenAudience: validateValue(env.TOKEN_EXCHANGE_AUDIENCES),
    tokenServiceUrl: validateValue(env.AUTH_PROXY_TOKEN_SERVICE_URL),
    postLogoutRedirectUri: validateValue(env.AUTH_POST_LOGOUT_REDIRECT_URL),
    regionIdentifier: env.AUTH_PROXY_REGION_IDENTIFIER,

    guestClientId: validateValue(env.AUTH_PROXY_GUEST_CLIENT_ID),
    guestClientSecret: validateValue(env.AUTH_PROXY_GUEST_CLIENT_SECRET),
    timeoutInterval: validateValue(env.AUTH_TIMEOUT_INTERVAL, 15),
    enableGuestLogin: env.ENABLE_GUEST_LOGIN === 'true',

    tracingConfig: {
      metricsInterval: Number(env.METRICS_INTERVAL),
      metricsPort: Number(env.METRICS_PORT),
      spanProcessorHost: env.SPAN_PROCESSOR_HOST,
      spanProcessorPort: Number(env.SPAN_PROCESSOR_PORT),
      serviceName: env.AUTH_SERVER_NAME
    }
  };
}

function validateValue(value: any, defaultValue: any = null) {
  return value || defaultValue;
}
