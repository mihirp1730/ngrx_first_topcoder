import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { LayerDataUpsertPrepService, UpsertEntity, UpsertRequest } from './layer-data-upsert-prep.service';

describe('LayerDataUpsertPrepService', () => {
  let provider: LayerDataUpsertPrepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LayerDataUpsertPrepService]
    }).compile();

    provider = module.get<LayerDataUpsertPrepService>(LayerDataUpsertPrepService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('prepare', () => {
    it('should not found an entity and treat as a creation', (done) => {
      jest.spyOn(provider, 'findEntity').mockReturnValue(Promise.resolve(null));
      const mockRequest = {
        setting: {
          id: 'test',
          name: 'test'
        },
        userId: 'test-user-id'
      } as UpsertRequest;
      const mockUpsertEntity = {
        last_modified_by: '',
        name: '',
        created_by: '',
        status: 'Experimental'
      } as UpsertEntity;

      provider.prepare(null, mockRequest, mockUpsertEntity).then((result) => {
        expect(result).toEqual({
          last_modified_by: '',
          name: 'test',
          created_by: 'test-user-id',
          status: 'Experimental'
        });
        done();
      });
    });

    it('should found an entity and treat it as an update', (done) => {
      jest.spyOn(provider, 'findEntity').mockReturnValue(
        Promise.resolve({ last_modified_by: '', name: 'test', created_by: 'test-user-id', status: 'Experimental' })
      );
      const mockRequest = {
        setting: {
          id: 'test',
          name: 'test'
        },
        userId: 'test-user-id'
      } as UpsertRequest;

      provider.prepare(null, mockRequest, null).then((result) => {
        expect(result).toEqual({
          last_modified_by: 'test-user-id',
          name: 'test',
          created_by: 'test-user-id',
          status: 'Experimental'
        });
        done();
      });
    });

    it('should found a predefine/final entity and throw an error', (done) => {
      jest.spyOn(provider, 'findEntity').mockReturnValue(
        Promise.resolve({ last_modified_by: '', name: 'test', created_by: 'test-user-id', status: 'Final' })
      );
      const mockRequest = {
        layer: {
          name: 'test',
          id: 'test'
        },
        userId: 'test-user-id'
      } as UpsertRequest;

      provider.prepare(null, mockRequest, null).catch((error) => {
        const {
          response: { errors }
        } = error;
        expect(errors).toEqual(['A layer with name "test" already exists with status Predefine or Final']);
        done();
      });
    });
  });

  it('should throw an error with mismatching names and id on a layer', (done) => {
    jest.spyOn(provider, 'findEntity').mockReturnValue(
      Promise.resolve({ last_modified_by: '', name: 'test', created_by: 'test-user-id', status: 'Final' })
    );
    const mockRequest = {
      layer: {
        name: 'test setting',
        id: 'test'
      },
      userId: 'test-user-id'
    } as UpsertRequest;

    provider.prepare(null, mockRequest, null).catch((error) => {
      const {
        response: { errors }
      } = error;
      expect(errors).toEqual(['layer name and layer id should match']);
      done();
    });
  });


  it('should create a query builder', (done) => {
    const mockRepository = ({
      createQueryBuilder: () => ({
        where: () => ({ getOne: jest.fn(() => Promise.resolve({ name: 'test' })) })
      })
    } as unknown) as Repository<UpsertEntity>;

    provider.findEntity(mockRepository, 'test').then((result) => {
      expect(result.name).toEqual('test');
      done();
    });
  });

  it('should create a query builder', (done) => {
    const mockRepository = ({
      metadata: { name: 'LayerMetadataEntity' },
      createQueryBuilder: () => ({
        where: () => ({
          andWhere: jest.fn(),
          delete: () => ({
            execute: jest.fn(() => Promise.resolve({ raw: null, affected: 1 }))
          })
        })
      })
    } as unknown) as Repository<UpsertEntity>;

    provider.deleteEntity(mockRepository, 'test').then((result) => {
      expect(result.affected).toEqual(1);
      done();
    });
  });
});
