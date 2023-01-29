import { Config } from './config.interface';
import { getEnvVars } from './get-env-vars';

/**
 * Gets a `Config` object with the app configuration given the node.js `process.env`.
 *
 * If on local, patches the config with values returned from `getLocalConfig()`.
 *
 * Used mostly as an standard "interface" to get/read all environment variables and other configuration values
 * for the app.
 */
export function getConfig(env: NodeJS.ProcessEnv): Config {
  const envVars = getEnvVars(env);

  // Computed / additional config.
  const computedConfig = {
    isProduction: envVars.isDocker,
    correctAccountNames: envVars.correctAccountName ? envVars.correctAccountName.trim().split(';') : [],
    ccmPartNumbers: envVars.ccmPartNumber ? envVars.ccmPartNumber.trim().split(';') : []
  };

  // Create config object.
  let config: Config = {
    ...envVars,
    ...computedConfig
  };

  // Patch with local config if on local.
  if (!computedConfig.isProduction) {
    config = {
      ...config,
      ...getLocalConfig()
    };
  }

  // Throw any errors on any missing (required) configuration values:
  if (!config.guestClientId || !config.guestClientSecret) {
    throw new Error('Guest client credentials are not configured!');
  }

  return config;
}

/**
 * Gets a partial "local" `Config` object, with values intended for development.
 *
 * Values could be hard-coded and/or load from a local-intended YAML (as were on 'call-validation-service).
 */
export function getLocalConfig(): Partial<Config> {
  return {
    appPort: 3333,

    correctAccountNames: ['wg-multiclient-ba'],
    validationCacheExpiration: 300,

    enableCsrfProtection: false,
    enableCsrfSecure: false,

    trafficManagerIssuer: 'cfs-traffic-manager',

    redirectUri: 'https://localhost:4200/api/auth/callback',
    regionIdentifier: 'dev',
    guestClientId: 'a3f1fdedda69451e812ae3b5a4465337',
    timeoutInterval: 15,
    enableGuestLogin: false,

    tracingConfig: {
      metricsInterval: 5000,
      metricsPort: 9090,
      spanProcessorHost: "http://localhost",
      spanProcessorPort: 9411,
      serviceName: "Auth-Server",
      isDev: true
    }
  };
}
