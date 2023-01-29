import { Test, TestingModule } from '@nestjs/testing';
import { LocalConfig } from './local.config';

describe('LocalConfig', () => {
  let provider: LocalConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalConfig]
    }).compile();

    provider = module.get(LocalConfig);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return isDeployed', () => {
    return provider.isDeployed().then((r) => {
      expect(r).toBeFalsy();
    });
  });

  it('should return logStorage', () => {
    return provider.logStorage().then((r) => {
      expect(r.type).toMatch('console');
    });
  });

  it('should return sessionStorage', () => {
    return provider.sessionStorage().then((r) => {
      expect(r.defaultUserSession).toBeDefined();
      expect(r.type).toMatch('memory');
    })
  })


 it('should return tracing config', () => {
   expect(provider.getTracingConfig()).toEqual({
      isDev: true,
      metricsInterval: 5000,
      metricsPort: 9090,
      spanProcessorHost: "http://localhost",
      spanProcessorPort: 9411,
      serviceName: "session-server"
    });
  })
});
