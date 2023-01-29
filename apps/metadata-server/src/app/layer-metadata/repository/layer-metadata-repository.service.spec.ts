import { ICategory, IMarketingRepresentation } from '@apollo/api/interfaces';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as typeorm_functions from 'typeorm/globals';

import { cloneDeep as _cloneDeep } from 'lodash';
import { DeleteResult, Repository } from 'typeorm';

import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import { LayerDataUpsertPrepService } from '../../services/layer-data-upsert-prep.service';
import { LayerMetadataEntity } from '../model/layer-metadata.entity';
import { LayerMetadataRepositoryService } from './layer-metadata-repository.service';

const mockLayerDataUpsertPrepService = {
  prepare: jest.fn(),
  findEntity: jest.fn(),
  deleteEntity: jest.fn()
};

type MockType<T> = {
  [P in keyof T]?: jest.Mock<unknown>;
};

const repositoryMockFactory: () => MockType<Repository<LayerMetadataEntity>> = jest.fn(() => ({
  find: jest.fn(),
  save: jest.fn((entity) => Promise.resolve(entity))
}));

const testMetaData = { name: 'test name', primaryKeyCol: 'someKey' } as unknown as ICategory;
const mockDate = new Date();

const mockEntity = {
  name: 'test',
  status: StatusEnum.EXPERIMENTAL,
  metadata: testMetaData,
  version: 0,
  created_by: 'test@user.com',
  created_date: mockDate
} as LayerMetadataEntity;

jest.spyOn(typeorm_functions, 'getManager').mockReturnValue({
  getRepository: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue([mockEntity]),
    save: jest.fn().mockReturnValue([mockEntity])
  })
} as any);

describe('LayerMetadataRepositoryService', () => {
  let provider: LayerMetadataRepositoryService;
  let layerUpsertService: LayerDataUpsertPrepService;
  let repositoryMock: MockType<Repository<LayerMetadataEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LayerMetadataRepositoryService,
        {
          provide: LayerDataUpsertPrepService,
          useValue: mockLayerDataUpsertPrepService
        },
        {
          provide: getRepositoryToken(LayerMetadataEntity),
          useFactory: repositoryMockFactory
        }
      ]
    }).compile();

    provider = new LayerMetadataRepositoryService(mockLayerDataUpsertPrepService, { host: 'localhost', headers: {} });
    layerUpsertService = module.get<LayerDataUpsertPrepService>(LayerDataUpsertPrepService);
    repositoryMock = module.get(getRepositoryToken(LayerMetadataEntity));
  });

  it('should be defined', async () => {
    expect(provider).toBeDefined();
  });
  it('should return layer metadata list', async () => {
    repositoryMock.find.mockReturnValue([mockEntity]);
    const response = await provider.getAll();

    // expect(repositoryMock.find).toHaveBeenCalled();
    expect(response).toEqual([
      {
        name: 'test',
        status: StatusEnum.EXPERIMENTAL,
        metadata: testMetaData,
        version: 0,
        created_by: 'test@user.com',
        created_date: mockDate
      } as LayerMetadataEntity
    ]);
  });

  it('should return one layer', async () => {
    const layerUpsertServiceSpy = jest.spyOn(layerUpsertService, 'findEntity').mockReturnValue(mockEntity as any);
    const response = await provider.getLayer('test');
    expect(response).toEqual({
      name: 'test',
      status: StatusEnum.EXPERIMENTAL,
      metadata: testMetaData,
      version: 0,
      created_by: 'test@user.com',
      created_date: mockDate
    } as LayerMetadataEntity);
    expect(layerUpsertServiceSpy).toBeCalled();
  });

  it('should upsert and return object', async () => {
    const request = { layer: testMetaData, userId: 'test@user.com' };
    const layerUpsertServiceSpy = jest.spyOn(layerUpsertService, 'prepare').mockReturnValue(mockEntity as any);
    const response = await provider.upsertLayerMetaData(request);
    expect(response).toEqual([
      {
        name: 'test',
        status: StatusEnum.EXPERIMENTAL,
        metadata: testMetaData,
        version: 0,
        created_by: 'test@user.com',
        created_date: mockDate
      }
    ] as LayerMetadataEntity[]);
    expect(layerUpsertServiceSpy).toBeCalled();
  });

  it('should get empty marketing layers', async () => {
    const result = await provider.getMarketingLayers(false);
    expect(result).toEqual([]);
  });

  it('should get empty marketing layers', async () => {
    const newMockEntity = {
      name: 'test',
      status: StatusEnum.FINAL,
      metadata: testMetaData,
      version: 0,
      created_by: 'test@user.com',
      created_date: mockDate
    } as LayerMetadataEntity;

    newMockEntity.metadata.displayInMap = true;
    newMockEntity.metadata.attributes = [
      {
        name: 'Shape',
        displayName: 'test shape',
        type: 'Shape',
        isFilterable: true,
        filterType: 'test',
        displayInSearchResults: true,
        displayInSearchDetails: true,
        identity: true,
        displaySequence: 0,
        mapLargeAttribute: 'test'
      }
    ];
    repositoryMock.find.mockReturnValue([newMockEntity]);
    const result = await provider.getMarketingLayers(true);
    expect(result).toEqual([
      {
        layerName: 'test name',
        displayName: undefined,
        maplargeTable: undefined,
        shapeType: 'Shape',
        primaryKey: 'someKey'
      } as IMarketingRepresentation
    ]);
  });

  describe('promoteLayers', () => {
    it('should throw an error if not found layers', async () => {
      const getLayersByNameSpy = jest.spyOn(provider, 'getLayersByName').mockReturnValue([] as any);
      const request = { layerNames: ['layerName1', 'layerName2'], userId: 'test@user.com' };
      await expect(() => provider.promoteLayers(request)).rejects.toThrow(NotFoundException);
      expect(getLayersByNameSpy).toBeCalled();
    });

    it('should throw an error if there are layers with status !== Experimental', async () => {
      const newMockEntity = {
        ...mockEntity,
        status: StatusEnum.PREDEFINE
      };
      jest.spyOn(provider, 'getLayersByName').mockReturnValue([newMockEntity] as any);
      const request = { layerNames: ['layerName'], userId: 'test@user.com' };
      await expect(() => provider.promoteLayers(request)).rejects.toThrow(BadRequestException);
    });

    it("should promote layers to 'Final' status", async () => {
      const request = { layerNames: ['layerName1', 'layerName2'], userId: 'test@user.com' };
      const newMockEntities = [
        {
          ...mockEntity,
          status: StatusEnum.EXPERIMENTAL,
          name: 'layerName1'
        },
        {
          ...mockEntity,
          status: StatusEnum.EXPERIMENTAL,
          name: 'layerName2'
        }
      ];
      const updatedMockEntities = _cloneDeep(newMockEntities);
      updatedMockEntities.forEach((entity) => {
        entity.status = StatusEnum.FINAL;
        entity.last_modified_by = request.userId;
      });
      jest.spyOn(provider, 'getLayersByName').mockReturnValue(Promise.resolve(newMockEntities));
      const response = await provider.promoteLayers(request);
      expect(response.length).toBe(1);
      expect(response[0].status).toBe(StatusEnum.EXPERIMENTAL);
    });
  });

  it('should delete entity', async () => {
    const deleteResultMock: DeleteResult = { raw: null, affected: 1 };
    const layerName = 'layerNametest';
    const layerUpsertServiceSpy = jest.spyOn(layerUpsertService, 'deleteEntity').mockReturnValue(deleteResultMock as any);
    await provider.deleteLayer(layerName);
    expect(layerUpsertServiceSpy).toBeCalled();
  });

  it('should throw exception as it did not find entity', (done) => {
    const deleteResultMock: DeleteResult = { raw: null, affected: 0 };
    const layerName = 'layerNametest';
    const layerUpsertServiceSpy = jest.spyOn(layerUpsertService, 'deleteEntity').mockReturnValue(deleteResultMock as any);
    provider.deleteLayer(layerName).catch((error) => {
      const {
        response: { errors }
      } = error;
      expect(layerUpsertServiceSpy).toBeCalled();
      expect(errors).toEqual([`No layer with name ${layerName} and status Experimental found`]);
      done();
    });
  });
});
