import { Test, TestingModule } from '@nestjs/testing';
import { EnvConfig } from './env.config';

describe('EnvConfig', () => {
  let provider: EnvConfig;
  const processEnv: NodeJS.ProcessEnv = {
    SESSION_SERVER_CONFIG_LOGSTORAGE_TYPE: 'test type'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: EnvConfig,
          useFactory: () => {
            return new EnvConfig(processEnv);
          }
        }
      ]
    }).compile();

    provider = module.get(EnvConfig);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return isDeployed', () => {
    return provider.isDeployed().then((r) => expect(r).toBeTruthy());
  });

  it('should return log storage', () => {
    return provider.logStorage().then((r) => expect(r.type).toBeDefined());
  });

  it('should return session storage', () => {
    return provider.sessionStorage().then((r) => {
      expect(r.defaultUserSession).toBeDefined();
      expect(r.type).toBeDefined();
    });
  });

  it('should return session storage components empty', () => {
    processEnv['SESSION_SERVER_CONFIG_SESSIONSTORAGE_DEFAULT_USER_SESSION_COMPONENTS'] = 'test';
    return provider.sessionStorage().then((r) => {
      expect(r.defaultUserSession).toBeDefined();
      expect(r.type).toBeDefined();
    });
  });

  it('should return tracing config', () => {
    // push env vars into process.env
    Object.entries({
      METRICS_INTERVAL: "5000",
      METRICS_PORT: "9090",
      SPAN_PROCESSOR_HOST: "http://localhost",
      SPAN_PROCESSOR_PORT: "9411",
      SESSION_SERVER_CONFIG_LOGGER_SERVICE_NAME: "session-server"
    }).forEach(([key, value]) => {
      processEnv[key] = value;
    });

    expect(provider.getTracingConfig()).toEqual({
      metricsInterval: 5000,
      metricsPort: 9090,
      spanProcessorHost: "http://localhost",
      spanProcessorPort: 9411,
      serviceName: "session-server"
    });
  })
});
