import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as typeorm_functions from 'typeorm/globals';
import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import { LayerMetadataRepositoryService } from '../../layer-metadata/repository/layer-metadata-repository.service';
import { LayerDataUpsertPrepService } from '../../services/layer-data-upsert-prep.service';
import { LayerSettingEntity } from '../model/layer-setting.entity';
import { LayerSettingRepositoryService } from './layer-setting-repository.service';

const mockLayerDataUpsertPrepService = {
  prepare: jest.fn().mockReturnValue(Promise.resolve())
};

const mockLayerMetadataRepositoryService = {
  getLayer: jest.fn().mockReturnValue(Promise.resolve())
};

type MockType<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: jest.Mock<{}>;
};

const repositoryMockFactory: () => MockType<Repository<LayerSettingEntity>> = jest.fn(
  () =>
    ({
      find: jest.fn(),
      save: jest.fn((entity) => Promise.resolve(entity)),
      createQueryBuilder: () => ({
        leftJoinAndSelect: () => ({
          select: () => ({
            where: () => ({
              getRawMany: () => Promise.resolve([])
            })
          })
        })
      })
    } as unknown)
);

jest.spyOn(typeorm_functions, 'getManager').mockReturnValue({
  getRepository: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnValue([]),
    save: jest.fn().mockReturnValue([]),
    createQueryBuilder: () => ({
      leftJoinAndSelect: () => ({
        select: () => ({
          where: () => ({
            getRawMany: () => Promise.resolve([])
          })
        })
      })
    })
  })
} as any);

describe('LayerSettingRepositoryService', () => {
  let provider: LayerSettingRepositoryService;
  let repositoryMock: MockType<Repository<LayerSettingEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LayerSettingRepositoryService,
        {
          provide: getRepositoryToken(LayerSettingEntity),
          useFactory: repositoryMockFactory
        },
        {
          provide: LayerDataUpsertPrepService,
          useValue: mockLayerDataUpsertPrepService
        },
        {
          provide: LayerMetadataRepositoryService,
          useValue: mockLayerMetadataRepositoryService
        }
      ]
    }).compile();

    provider = new LayerSettingRepositoryService(mockLayerDataUpsertPrepService as any, mockLayerMetadataRepositoryService as any, {
      host: 'localhost',
      headers: {}
    });
    repositoryMock = module.get(getRepositoryToken(LayerSettingEntity));
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should call the find method from the repository', (done) => {
    repositoryMock.find.mockReturnValue(Promise.resolve([]));
    provider.getAll().then((result) => {
      expect(result).toEqual([]);
      done();
    });
  });

  it('should call the save method from the repository', (done) => {
    const mockSetting = {
      name: 'test'
    } as IGisLayerSettings;
    mockLayerDataUpsertPrepService.prepare.mockReturnValue(Promise.resolve({ name: 'entity-test' }));
    mockLayerMetadataRepositoryService.getLayer.mockReturnValue(Promise.resolve('test-fkey'));
    provider
      .upsertLayerSetting({
        setting: mockSetting,
        userId: 'test-user-id'
      })
      .then((result) => {
        expect(result).toEqual([]);
      });
    done();
  });

  it('should thrown an exception if not metadata layer is associated to setting', (done) => {
    const mockSetting = {
      id: 'test',
      name: 'test'
    } as IGisLayerSettings;
    mockLayerDataUpsertPrepService.prepare.mockReturnValue(Promise.resolve({ name: 'entity-test' }));
    const metadataRepoSpy = mockLayerMetadataRepositoryService.getLayer.mockReturnValue(Promise.resolve(null));

    provider
      .upsertLayerSetting({
        setting: mockSetting,
        userId: 'test-user-id'
      })
      .catch((error) => {
        const {
          response: { errors }
        } = error;
        expect(metadataRepoSpy).toBeCalled();
        expect(errors).toEqual([`Please validate that the id test matches the metadata layer name to be associated with`]);
        done();
      });
  });
});
