import { Config } from './config.interface';
import { getConfig, getLocalConfig } from './get-config';
import { getEnvVars } from './get-env-vars';

describe('getConfigfifo', () => {
  describe('basic local and prod tests', () => {
    it('should return all config properties (i.e. return env variables with computed configuration properties) (for prod)', () => {
      const mockProcessEnv: typeof process.env = {
        AUTH_PROXY_DOCKER: 'true', // This will translate as if running on prod.
        AUTH_PROXY_GUEST_CLIENT_ID: 'test_guest_id',
        AUTH_PROXY_GUEST_CLIENT_SECRET: 'test_secret'
      };
      const envVars = getEnvVars(mockProcessEnv);
      const expectedComputedConfig = {
        isProduction: true,
        correctAccountNames: [],
        ccmPartNumbers: []
      };

      const resultConfig = getConfig(mockProcessEnv);

      const expectedConfig: Config = {
        ...envVars,
        ...expectedComputedConfig
      };

      expect(resultConfig).toEqual(expectedConfig);
    });

    it('should return all config properties patched with a local config (for local)', () => {
      const mockProcessEnv: typeof process.env = {
        AUTH_PROXY_DOCKER: 'false', // This will translate as if running on local.
        AUTH_PROXY_GUEST_CLIENT_ID: 'test_guest_id',
        AUTH_PROXY_GUEST_CLIENT_SECRET: 'test_secret'
      };
      const envVars = getEnvVars(mockProcessEnv);
      const expectedComputedConfig = {
        isProduction: false,
        correctAccountNames: [],
        ccmPartNumbers: []
      };

      const resultConfig = getConfig(mockProcessEnv);

      const expectedConfig: Config = {
        ...envVars,
        ...expectedComputedConfig,
        ...getLocalConfig()
      };

      expect(resultConfig).toEqual(expectedConfig);
    });
  });

  it('should correctly create computed config properties', () => {
    const mockProcessEnv: typeof process.env = {
      AUTH_PROXY_DOCKER: 'true', // This will translate as if running on prod.
      AUTH_PROXY_CORRECT_ACCOUNT_NAME: 'aa;bb;cc',
      AUTH_PROXY_CCM_PART_NUMBER: 'a12;b44;c56',
      AUTH_PROXY_GUEST_CLIENT_ID: 'test_guest_id',
      AUTH_PROXY_GUEST_CLIENT_SECRET: 'test_secret'
    };
    const envVars = getEnvVars(mockProcessEnv);
    const expectedComputedConfig = {
      isProduction: true,
      correctAccountNames: ['aa', 'bb', 'cc'],
      ccmPartNumbers: ['a12', 'b44', 'c56']
    };

    const resultConfig = getConfig(mockProcessEnv);

    const expectedConfig: Config = {
      ...envVars,
      ...expectedComputedConfig
    };

    expect(resultConfig).toEqual(expectedConfig);
  });

  it('should correct create tracing config', () => {
    const mockProcessEnv: typeof process.env = {
      AUTH_PROXY_GUEST_CLIENT_ID: 'test_guest_id',
      AUTH_PROXY_GUEST_CLIENT_SECRET: 'test_secret',

      METRICS_INTERVAL: "5000",
      METRICS_PORT: "9090",
      SPAN_PROCESSOR_HOST: "http://localhost",
      SPAN_PROCESSOR_PORT: "9411",
      AUTH_SERVER_NAME: "Auth-Server"
    };

    expect(getConfig(mockProcessEnv).tracingConfig).toEqual({
      isDev: true,
      metricsInterval: 5000,
      metricsPort: 9090,
      spanProcessorHost: 'http://localhost',
      spanProcessorPort: 9411,
      serviceName: 'Auth-Server'
    });
  })
});
