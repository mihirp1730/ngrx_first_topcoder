import { localVariables } from './local-variables';
import { LocalConfig } from './local.config';

describe('LocalConfig', () => {
  let localConfig: LocalConfig;
  let mockProcess: NodeJS.Process;

  beforeEach(async () => {
    mockProcess = {
      stdout: null
    } as unknown as NodeJS.Process;
    localConfig = new LocalConfig(mockProcess);
  });

  it('should be created', () => {
    expect(localConfig).toBeDefined();
  });

  describe('getConfiguration', () => {
    it('should return config', async () => {
      const config = await localConfig.getConfiguration();
      expect(config).toBeTruthy();
    });
  });

  describe('getTracingConfig', () => {
    it('should return config', async () => {
      const config = await localConfig.getTracingConfig();
      expect(config).toBeTruthy();
    });
  });

  describe('getMapConfiguration', () => {
    it('should return map large configurations', async () => {
      const config = localConfig.getMapConfiguration('localhost', 'testuser1@slb.com');
      expect(config.mapAccount).toBe('vd8-common');
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configurations', async () => {
      const config = localConfig.getDatabaseConfig('localhost', 'liveuser@slb.com');
      expect(config.schema).toBe('xchange');
    });
  });

  describe('getTypeORMConfig', () => {
    it('should return typeorm configurations', async () => {
      const config = await localConfig.getTypeORMConfig();
      expect(config).toEqual({
        port: Number(localVariables.TYPEORM_PORT),
        username: localVariables.TYPEORM_USERNAME,
        password: localVariables.TYPEORM_PASSWORD,
        database: localVariables.TYPEORM_DATABASE,
        schema: localVariables.TYPEORM_SCHEMA
      });
    });
  });

  describe('getConsumerAppUrl', () => {
    it('should return consumer url', async () => {
      const config = localConfig.getConsumerAppUrl('localhost', 'liveuser@slb.com','vd7-Id');
      expect(config).toBe('localhost');
    });
  });

  describe('getDataBaseInfo', () => {
    it('should return database info', async () => {
      const config = localConfig.getDataBaseInfo('localhost', 'liveuser@slb.com', {key:'associatedConsumerUrl',value: 'localhost'});
      expect(config.databaseConfig.associatedConsumerUrl).toBe('localhost');
    });
  });
});
