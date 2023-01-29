import { FeatureFlagService } from '@apollo/server/feature-flag';
import { ISauth, JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { HttpStatus, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { noop } from 'lodash';
import { SettingsService } from './../../services/settings.service';

import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import { LayerSettingEntityMapper } from '../mapper/layer-setting-entity.mapper';
import { LayerSettingRepositoryService } from '../repository/layer-setting-repository.service';
import { SettingsController } from './settings.controller';

class MockSettingsService {
  getEnvironmentSettings = noop;
  getMapSettings = noop;
  postLayerSetting = noop;
  getMapConfiguration = noop;
  getHostAssociatedConsumerUrl = noop;
}

class MockFeatureFlagService {
  getTreatment = noop;
  getFeatureFlag = noop;
  initializeSDK = noop;
  converTreatment = noop;
}

class MockLayerSettingRepositoryService {
  getAll = noop;
  upsertLayerSetting = noop;
}

class MockLogger {
  error = jest.fn();
  log = jest.fn();
}

describe('SettingsController', () => {
  let controller: SettingsController;
  let providerSettings: SettingsService;
  let mockFeatureFlagService: FeatureFlagService;
  let mockLayerSettingRepositoryService: LayerSettingRepositoryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useClass: MockSettingsService
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService
        },
        {
          provide: LayerSettingRepositoryService,
          useClass: MockLayerSettingRepositoryService
        },
        {
          provide: Logger,
          useClass: MockLogger
        }
      ]
    }).compile();
    controller = module.get<SettingsController>(SettingsController);
    providerSettings = module.get<SettingsService>(SettingsService);
    mockFeatureFlagService = module.get<FeatureFlagService>(FeatureFlagService);
    mockLayerSettingRepositoryService = module.get<LayerSettingRepositoryService>(LayerSettingRepositoryService);
  });

  beforeEach(() => {
    jest.spyOn(JwtTokenMiddleware, 'getToken').mockReturnValue('abcd');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getEnvironmentSettings', () => {
    it('should call the getEnvironmentSettings method', async () => {
      jest.spyOn(providerSettings, 'getEnvironmentSettings').mockReturnValue({} as any);
      const environment = await controller.getEnvironmentSettings();
      expect(environment).toBeDefined();
    });

    it('should call the settings service getEnvironmentSettings method', async () => {
      const getEnvironmentSpy = jest.spyOn(providerSettings, 'getEnvironmentSettings').mockReturnValue(null);
      await controller.getEnvironmentSettings();
      expect(getEnvironmentSpy).toHaveBeenCalled();
    });

    it('should throw error when getEnvironmentSettings method has error', async () => {
      jest.spyOn(providerSettings, 'getEnvironmentSettings').mockImplementationOnce(() => {
        throw new Error('error test on getEnvironment');
      });
      await expect(controller.getEnvironmentSettings()).rejects.toThrow();
    });
  });

  it('getMapSettings should call the settings service getMapSettings method', (done) => {
    jest.spyOn(mockFeatureFlagService, 'getFeatureFlag').mockReturnValue(false);
    jest.spyOn(LayerSettingEntityMapper, 'fromEntityList').mockReturnValue([
      {
        status: 'Final',
        setting: {}
      },
      {
        status: 'Experimental',
        setting: {}
      }
    ] as any);
    const spy = jest.spyOn(mockLayerSettingRepositoryService, 'getAll').mockReturnValue(Promise.resolve({} as any));

    controller.getMapSettings({ 'slb-data-partition-id': 'test-partition' }, { subid: 'test-subid' } as ISauth).then((r) => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('getMapSettings should call the settings service getMapSettings method, no data partition header', (done) => {
    jest.spyOn(mockFeatureFlagService, 'getFeatureFlag').mockReturnValue(false);
    jest.spyOn(LayerSettingEntityMapper, 'fromEntityList').mockReturnValue([
      {
        status: 'Final',
        setting: {}
      },
      {
        status: 'Experimental',
        setting: {}
      }
    ] as any);
    const spy = jest.spyOn(mockLayerSettingRepositoryService, 'getAll').mockReturnValue(Promise.resolve({} as any));

    controller.getMapSettings({}, { subid: 'test-subid' } as ISauth).then((r) => {
      expect(spy).toHaveBeenCalled();
      done();
    });
  });

  it('should throw an exception when name of the setting is empty', async () => {
    const sauth = {} as ISauth;
    const spyRepositoryService = jest
      .spyOn(mockLayerSettingRepositoryService, 'upsertLayerSetting')
      .mockReturnValue(Promise.resolve({} as any));
    try {
      await controller.postLayerSetting(sauth, {
        name: ''
      } as IGisLayerSettings);
    } catch (e) {
      expect(e.response).toEqual({
        errors: ['The name provided is not valid.', 'The id provided is not valid.']
      });
      expect(e.status).toEqual(HttpStatus.BAD_REQUEST);
    }
    expect(spyRepositoryService).not.toBeCalled();
  });

  it('postLayerSetting should call the settings service postLayerSetting method', async () => {
    jest.spyOn(LayerSettingEntityMapper, 'fromEntity').mockReturnValue({ setting: {} } as any);
    const spy = jest.spyOn(mockLayerSettingRepositoryService, 'upsertLayerSetting').mockReturnValue(Promise.resolve({} as any));

    await controller.postLayerSetting({ subid: 'test-subid' } as ISauth, { id: 'testName', name: 'testName' } as IGisLayerSettings);
    expect(spy).toHaveBeenCalled();
  });

  describe('exclusive-map-config', () => {
    it('getExclusiveMapConfiguration should call the settings service to get the exclusive map details', () => {
      jest
        .spyOn(JwtTokenMiddleware, 'getToken')
        .mockReturnValue(
          'eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1UWTNNRGs0TXpJeE1RPT0iLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        );
      const response = controller.getExclusiveMapConfiguration({ headers: {} });
      expect(response.statusCode).toBe(200);
    });
    it('getExclusiveMapConfiguration should call and throw error', () => {
      jest.spyOn(JwtTokenMiddleware, 'getToken').mockReturnValue(new Error());
      const response = controller.getExclusiveMapConfiguration({});
      expect(response).toBeUndefined();
    });
  });

  describe('consumer-url', () => {
    it('getHostAssociatedConsumerUrl should call the settings service to get the related consumer application url', () => {
      jest
        .spyOn(JwtTokenMiddleware, 'getToken')
        .mockReturnValue(
          'eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1UWTNNRGs0TXpJeE1RPT0iLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
        );
      const response = controller.getConsumerUrlConfig({ headers: '' }, 'vd7-Id');
      expect(response.statusCode).toBe(200);
    });
    it('getHostAssociatedConsumerUrl should call and throw error', () => {
      jest.spyOn(JwtTokenMiddleware, 'getToken').mockReturnValue(new Error());
      const response = controller.getConsumerUrlConfig({}, 'vd7');
      expect(response).toBeUndefined();
    });
  });
});
