import { EnvConfig } from './env.config';
import { localVariables } from './local-variables';

class MockLogger {
  error = jest.fn();
  log = jest.fn();
}

describe('EnvConfig', () => {
  let envConfig: EnvConfig;
  let mockProcess: NodeJS.Process;

  beforeEach(async () => {
    mockProcess = {
      env: {},
      stdout: null
    } as unknown as NodeJS.Process;
    envConfig = new EnvConfig(mockProcess, new MockLogger() as any);
  });

  it('should be created', () => {
    expect(envConfig).toBeDefined();
  });

  describe('getConfiguration', () => {
    it('should return config', async () => {
      const config = await envConfig.getConfiguration();
      expect(config).toBeTruthy();
    });
    xit('should return config w/requestValidations', async () => {
      mockProcess.env.TRAFFIC_MANAGER_IS_ENABLED = 'true';
      const config = await envConfig.getConfiguration();
      expect(config).toBeTruthy();
      expect(config.requestValidations.length).toBe(1);
    });
  });

  describe('getTracingConfig', () => {
    it('should return config', async () => {
      mockProcess.env.METRICS_INTERVAL = '5000';
      mockProcess.env.METRICS_PORT = '9090';
      const config = await envConfig.getTracingConfig();
      expect(config).toBeTruthy();
    });
  });

  describe('getMapConfiguration', () => {
    it('should return map large configurations', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = localVariables.CONSUMER_DETAILS_FE as any;
      const config = envConfig.getMapConfiguration('localhost', 'testuser1@slb.com');
      expect(config.mapAccount).toBe('vd8-common');
    });
  });

  describe('getDatabaseConfig', () => {
    it('should return database configurations', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = localVariables.CONSUMER_DETAILS_FE as any;
      mockProcess.env.DATABASE_DETAILS_FE = localVariables.DATABASE_DETAILS_FE as any;
      const config = envConfig.getDatabaseConfig('localhost', 'liveuser@slb.com');
      expect(config.schema).toBe('xchange');
    });

    it('should return database configurations, exception', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = "[{'consumerURL':'localhost','mapType':'Public','accountDetails'}]";
      mockProcess.env.DATABASE_DETAILS_FE = "[{'dbId':'commonDb','dbDetails':{'dbURL':'','dbUsername':";
      const config = envConfig.getDatabaseConfig('localhost', 'liveuser@slb.com');
      expect(config).toBeUndefined();
    });
  });

  describe('getTypeORMConfig', () => {
    it('should return typeorm configurations', async () => {
      mockProcess.env.DB_PORT = '8080';
      mockProcess.env.DB_USER = 'DB_USER';
      mockProcess.env.DB_PASS = 'DB_PASS';
      mockProcess.env.DB_NAME = 'DB_NAME';
      mockProcess.env.DB_SCHEMA = 'DB_SCHEMA';
      const config = await envConfig.getTypeORMConfig();
      expect(config).toEqual({
        port: 8080,
        username: 'DB_USER',
        password: 'DB_PASS',
        database: 'DB_NAME',
        schema: 'DB_SCHEMA'
      });
    });
  });

  describe('getConsumerAppUrl', () => {
    it('should return consumer url', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = localVariables.CONSUMER_DETAILS_FE as any;
      mockProcess.env.DATABASE_DETAILS_FE = localVariables.DATABASE_DETAILS_FE as any;
      const config = envConfig.getConsumerAppUrl('localhost', 'liveuser@slb.com', 'vd7-Id');
      expect(config).toBe('localhost');
    });

    it('should return consumer url, exception', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = "[{'consumerURL':'localhost','mapType':'Public','accountDetails'}]";
      mockProcess.env.DATABASE_DETAILS_FE = "[{'dbId':'commonDb','dbDetails':{'dbURL':'','dbUsername':";
      const config = envConfig.getConsumerAppUrl('localhost', 'liveuser@slb.com','vd7-Id');      
      expect(config).toBeUndefined();
    });
  });

  describe('getDataBaseInfo', () => {
    it('should return database info', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = localVariables.CONSUMER_DETAILS_FE as any;
      mockProcess.env.DATABASE_DETAILS_FE = localVariables.DATABASE_DETAILS_FE as any;
      const config = envConfig.getDataBaseInfo('localhost', 'liveuser@slb.com', {key:'associatedConsumerUrl',value: 'localhost'});
      expect(config.databaseConfig.associatedConsumerUrl).toBe('localhost');
    });

    it('should return database, exception', async () => {
      mockProcess.env.CONSUMER_DETAILS_FE = "[{'consumerURL':'localhost','mapType':'Public','accountDetails'}]";
      mockProcess.env.DATABASE_DETAILS_FE = "[{'dbId':'commonDb','dbDetails':{'dbURL':'','dbUsername':";
      const config = envConfig.getDataBaseInfo('localhost', 'liveuser@slb.com',{key:'associatedConsumerUrl',value: 'localhost'});      
      expect(config).toBeUndefined();
    });
  });
});
