import { Test, TestingModule } from '@nestjs/testing';
import { size } from 'lodash';

import { BaseConfig } from '../config/base.config';
import { SettingsService } from './settings.service';

class MockMapWrapperConfigLayersOptions {
  pathToFolder = 'apps/metadata-server/src/data/map-wrapper-component-config-layers';
}

class MockSettingsService {
  getDatabaseConfig = jest.fn().mockReturnValue({
    schema: 'schema'
  });
  getMapConfiguration = jest.fn().mockReturnValue({
    mapAccount: 'mapAccount'
  });
  getConsumerAppUrl= jest.fn().mockReturnValue('localhost')
}
describe('SettingsService', () => {
  let provider: SettingsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MockMapWrapperConfigLayersOptions,
        {
          provide: BaseConfig,
          useValue: {
            map: {
              deploymentUrl: 'deploymentUrl'
            }
          }
        },
        {
          provide: SettingsService,
          inject: [BaseConfig],
          useFactory: (b) => new SettingsService(b, new MockSettingsService() as any)
        }
      ]
    }).compile();

    provider = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return environment settings', () => {
    const data = provider.getEnvironmentSettings();
    expect(size(data)).toBeGreaterThanOrEqual(0);
  });
  it('should return environment settings', () => {
    const data = provider.getMapConfiguration('localhost', 'testuser@gmail.com');
    expect(data.mapAccount).toBe('mapAccount');
  });
  it('should return environment settings', () => {
    const data = provider.getDatabaseConfiguration('localhost', 'testuser@gmail.com');
    expect(data.schema).toBe('schema');
  });
  it('should return consumer url', () => {
    const data = provider.getHostAssociatedConsumerUrl('localhost', 'testuser@gmail.com','vd7-Id');
    console.log(data);
    
    expect(data).toBe('localhost');
  });
});
