import { ConfigModule } from './config.module';
import { EnvConfig } from './env.config';
import { LocalConfig } from './local.config';

class MockLogger {
  error = jest.fn();
  log = jest.fn();
}

describe('ConfigModule', () => {
  describe('BaseConfigFactory', () => {
    it('should return an EnvConfig', async () => {
      const baseConfig = await ConfigModule.BaseConfigFactory(
        {
          env: {
            METADATA_SERVER_DEPLOY: 'true'
          }
        } as unknown as NodeJS.Process,
        MockLogger as any
      );
      expect(baseConfig).toBeTruthy();
      expect(baseConfig).toBeInstanceOf(EnvConfig);
    });

    it('should return a LocalConfig', async () => {
      const baseConfig = await ConfigModule.BaseConfigFactory(
        {
          env: {}
        } as unknown as NodeJS.Process,
        MockLogger as any
      );
      expect(baseConfig).toBeTruthy();
      expect(baseConfig).toBeInstanceOf(LocalConfig);
    });
  });
});
