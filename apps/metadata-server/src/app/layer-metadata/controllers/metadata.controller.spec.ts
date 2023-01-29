import { ICategory } from '@apollo/api/interfaces';
import { FeatureFlagService } from '@apollo/server/feature-flag';
import { ISauth } from '@apollo/server/jwt-token-middleware';
import { HttpStatus, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppHealthService } from '@apollo/app/health';
import { noop } from 'lodash';

import { MetadataService } from '../../services/metadata.service';
import { SettingsService } from '../../services/settings.service';
import { LayerMetadataRepositoryService } from '../repository/layer-metadata-repository.service';
import { MetadataController } from './metadata.controller';

class MockMetadataService {
  getLayers = noop;
  getMarketingLayers = noop;
  getLayer = noop;
  postLayer = noop;
  getPublicLayers = noop;
  getMetadata = noop;
  convertCategoryToMR = noop;
}

class MockServerHealthService {
  healthCheck = jest.fn();
}

class MockSettingsService {
  init = noop;
  getEnvironmentSettings = noop;
  getMapSettings = noop;
  postLayerSetting = noop;
  loadMapLayerSettings = noop;
}

class MockLayerMetadataRepositoryService {
  getAll = noop;
  upsertLayerMetaData = noop;
  promoteLayers = noop;
  getLayer = noop;
  getMarketingLayers = noop;
  deleteLayer = noop;
}

class MockFeatureFlagService {
  getTreatment = jest.fn();
  getFeatureFlag = jest.fn();
  initializeSDK = jest.fn();
  converTreatment = jest.fn();
}

describe('MetadataController', () => {
  let controller: MetadataController;
  let providerMetadata: MetadataService;
  let providerMetadataRepository: LayerMetadataRepositoryService;
  let mockServerHealthService: MockServerHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetadataController],
      providers: [
        {
          provide: MetadataService,
          useClass: MockMetadataService
        },
        {
          provide: SettingsService,
          useClass: MockSettingsService
        },
        {
          provide: LayerMetadataRepositoryService,
          useClass: MockLayerMetadataRepositoryService
        },
        {
          provide: FeatureFlagService,
          useClass: MockFeatureFlagService
        },
        {
          provide: AppHealthService,
          useClass: MockServerHealthService
        }
      ]
    }).compile();

    controller = module.get<MetadataController>(MetadataController);
    providerMetadata = module.get<MetadataService>(MetadataService);
    providerMetadataRepository = module.get<LayerMetadataRepositoryService>(LayerMetadataRepositoryService);
    mockServerHealthService = module.get(AppHealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLayers', () => {
    it('should call the metadata services getAll method', async () => {
      const sauth = {} as ISauth;
      const session = {} as any;
      const getMetadataSpy = jest.spyOn(providerMetadataRepository, 'getAll').mockReturnValue(null);
      controller.getLayers(session, sauth);
      expect(getMetadataSpy).toHaveBeenCalled();
    });
  });

  describe('getLayer', () => {
    it('should call the metadata services getLayer method', async () => {
      const getMetadataSpy = jest.spyOn(providerMetadataRepository, 'getLayer').mockReturnValue(null);
      controller.getLayer('test');
      expect(getMetadataSpy).toHaveBeenCalled();
    });
  });

  describe('getRegions', () => {
    it('should call the metadata services getRegions method', () => {
      const regions = controller.getRegions();
      expect(regions.length).toBe(8);
    });
  });

  describe('postLayer', () => {
    it('should call the metadata services upsertLayerMetaData method', async () => {
      const getMetadataSpy = jest.spyOn(providerMetadataRepository, 'upsertLayerMetaData').mockReturnValue(null);
      const sauth = {} as ISauth;
      controller.postLayer(sauth, {
        id: 'test',
        name: 'Test',
        attributes: [
          {
            name: 'Shape',
            type: 'geo.poly'
          }
        ]
      } as ICategory);
      expect(getMetadataSpy).toHaveBeenCalled();
    });

    it('should throw an exception when the layer already exist', () => {
      jest.spyOn(providerMetadata, 'getPublicLayers').mockReturnValue(['test']);
      const sauth = {} as ISauth;
      try {
        controller.postLayer(sauth, {
          name: 'Test',
          attributes: [
            {
              name: 'Shape',
              type: 'geo.poly'
            }
          ]
        } as ICategory);
      } catch (e) {
        expect(e.response).toEqual({ errors: ['Layer name already exist'] });
        expect(e.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an exception when some layer attributes are wrong', () => {
      jest.spyOn(providerMetadata, 'getPublicLayers').mockReturnValue([]);
      const sauth = {} as ISauth;
      try {
        controller.postLayer(sauth, {
          name: 'Test',
          attributes: [
            {
              name: 'Name',
              type: 'Text'
            }
          ]
        } as ICategory);
      } catch (e) {
        expect(e.response).toEqual({ errors: ['Shape attribute is missing.', 'Type of Name attribute is invalid.'] });
        expect(e.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw an exception when name is empty and some layer attributes are wrong', () => {
      const spyMetaDataRepositoryService = jest.spyOn(providerMetadataRepository, 'upsertLayerMetaData').mockReturnValue([] as any);
      const sauth = {} as ISauth;
      try {
        controller.postLayer(sauth, {
          name: '',
          attributes: [
            {
              name: 'Name',
              type: 'Text'
            }
          ]
        } as ICategory);
      } catch (e) {
        expect(e.response).toEqual({
          errors: ['Shape attribute is missing.', 'Type of Name attribute is invalid.', 'The name provided is not valid.']
        });
        expect(e.status).toEqual(HttpStatus.BAD_REQUEST);
      }
      expect(spyMetaDataRepositoryService).not.toBeCalled;
    });
  });

  describe('promoteLayers', () => {
    it('should call promote layers method from metadata repository service', async () => {
      const spyMetaDataRepositoryPromoteLayer = jest
        .spyOn(providerMetadataRepository, 'promoteLayers')
        .mockReturnValue(Promise.resolve([]));
      const sauth = {} as ISauth;
      await controller.promoteLayers(sauth, ['layerName']);
      expect(spyMetaDataRepositoryPromoteLayer).toBeCalled();
    });
  });

  describe('deletelayer', () => {
    it('should delete layer metadata', async () => {
      const spyMetaDataServiceDelete = jest.spyOn(providerMetadataRepository, 'deleteLayer').mockImplementation();
      const someLayer = 'testLayer';

      await controller.deleteLayer(someLayer);
      expect(spyMetaDataServiceDelete).toHaveBeenCalled();
    });
  });

  describe('getMarketingLayers', () => {
    it('should call the metadata services getMarketingLayers method', () => {
      const sauth = {} as ISauth;
      const session = {
        'slb-data-partition-id': 'wgmc'
      } as any;
      const getMetadataSpy = jest.spyOn(providerMetadataRepository, 'getMarketingLayers').mockReturnValue(null);
      controller.getMarketingLayers(session, sauth);
      expect(getMetadataSpy).toHaveBeenCalled();
    });
  });

  describe('error cases', () => {
    it('should return correct httpStatus and message error when getLayers shows error', () => {
      const errorMsg = 'fake error';
      const getMetadataRepositorySpy = jest.spyOn(providerMetadataRepository, 'getAll').mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });
      controller.getLayers({}, {} as ISauth);
      expect(getMetadataRepositorySpy).toHaveBeenCalled();
    });
    it('should return correct httpStatus and message error when getLayer shows error', () => {
      const errorMsg = 'fake error';
      const getMetadataRepositorySpy = jest.spyOn(providerMetadataRepository, 'getLayer').mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });
      controller.getLayer('well');
      expect(getMetadataRepositorySpy).toHaveBeenCalled();
    });
    it('should return correct httpStatus and message error when getMarketingLayers shows error', () => {
      const errorMsg = 'fake error';
      const getMetadataRepositorySpy = jest.spyOn(providerMetadataRepository, 'getMarketingLayers').mockImplementationOnce(() => {
        throw new Error(errorMsg);
      });
      try {
        controller.getMarketingLayers({}, {} as ISauth);
      } catch (error) {
        const expectedMessage = `An error occurred during 'getMarketingLayers' execution: Error: ${errorMsg}!`;
        expect(getMetadataRepositorySpy).toHaveBeenCalled();
        expect(error.response).toEqual({ errors: [expectedMessage] });
      }
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockServerHealthService.healthCheck.mockReturnValue({ statusCode: 200, message: 'OK', error: 'No Error' });
      const res = controller.getHealthCheck('test');

      expect(res).toEqual({ statusCode: 200, message: 'OK', error: 'No Error' });
    });

    it('should raise NotFoundException for health check', async () => {
      mockServerHealthService.healthCheck.mockImplementation(() => {
        throw new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        });
      });

      expect(() => controller.getHealthCheck(null)).toThrow(
        new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        })
      );
    });
  });
});
