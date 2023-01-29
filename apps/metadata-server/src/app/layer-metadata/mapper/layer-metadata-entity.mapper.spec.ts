import { ICategory } from '@apollo/api/interfaces';
import { Test, TestingModule } from '@nestjs/testing';

import { StatusEnum } from '../../../commons/enums/meta-data.enum';
import { LayerMetadata } from '../model/layer-metadata';
import { LayerMetadataEntity } from '../model/layer-metadata.entity';
import { LayerMetadataEntityMapper } from './layer-metadata-entity.mapper';

describe('LayerMetadataEntityMapper', () => {
  let mapper: LayerMetadataEntityMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LayerMetadataEntityMapper]
    }).compile();

    mapper = module.get<LayerMetadataEntityMapper>(LayerMetadataEntityMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  it('should convert LayerMetadataEntity to LayerMetadata', () => {
    const mockDate = new Date();
    const mockCategory = ({ zIndex: 0, primaryKeyCol: 'key' } as unknown) as ICategory;
    const mockEntity = {
      name: 'test',
      status: StatusEnum.EXPERIMENTAL,
      metadata: mockCategory,
      version: 0,
      created_by: 'test',
      created_date: mockDate,
      last_modified_by: mockDate.toString(),
      last_modified_date: mockDate
    } as LayerMetadataEntity;

    const layerMetadata = LayerMetadataEntityMapper.fromEntity(mockEntity);
    expect(layerMetadata).toEqual({
      name: 'test',
      status: StatusEnum.EXPERIMENTAL,
      metadata: mockCategory,
      version: 0,
      createdBy: 'test',
      createDateTime: mockDate,
      lastChangedBy: mockDate.toString(),
      lastChangedDateTime: mockDate
    });
  });

  it('should convert LayerMetadata to LayerMetadataEntity', () => {
    const mockDate = new Date();
    const mockCategory = ({ zIndex: 0, primaryKeyCol: 'key' } as unknown) as ICategory;
    const mockLayerMetadata = {
      name: 'test',
      status: StatusEnum.EXPERIMENTAL,
      metadata: mockCategory,
      version: 0,
      createdBy: 'test',
      createDateTime: mockDate,
      lastChangedBy: mockDate.toString(),
      lastChangedDateTime: mockDate
    } as LayerMetadata;

    const layerMetadataEntity = LayerMetadataEntityMapper.toEntity(mockLayerMetadata);
    expect(layerMetadataEntity).toEqual({
      name: 'test',
      status: StatusEnum.EXPERIMENTAL,
      metadata: mockCategory,
      version: 0,
      created_by: 'test',
      created_date: mockDate,
      last_modified_by: mockDate.toString(),
      last_modified_date: mockDate
    });
  });

  it('should convert LayerMetadataEntityList to LayerMetadataList', () => {
    const mockDate = new Date();
    const mockCategory = ({ zIndex: 0, primaryKeyCol: 'key' } as unknown) as ICategory;
    const mockEntity = [
      {
        name: 'test',
        status: StatusEnum.EXPERIMENTAL,
        metadata: mockCategory,
        version: 0,
        created_by: 'test',
        created_date: mockDate,
        last_modified_by: mockDate.toString(),
        last_modified_date: mockDate
      } as LayerMetadataEntity
    ];

    const layerMetadata = LayerMetadataEntityMapper.fromEntityList(mockEntity);
    expect(layerMetadata).toEqual([
      {
        name: 'test',
        status: StatusEnum.EXPERIMENTAL,
        metadata: mockCategory,
        version: 0,
        createdBy: 'test',
        createDateTime: mockDate,
        lastChangedBy: mockDate.toString(),
        lastChangedDateTime: mockDate
      }
    ]);
  });
});
