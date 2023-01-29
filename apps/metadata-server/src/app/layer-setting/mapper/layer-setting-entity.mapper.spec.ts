import { Test, TestingModule } from '@nestjs/testing';

import { IGisLayerSettings } from '../../../commons/interfaces/gis-settings';
import { LayerSetting } from '../model/layer-setting';
import { LayerSettingEntity } from '../model/layer-setting.entity';
import { LayerSettingEntityMapper } from './layer-setting-entity.mapper';

describe('LayerMetadataEntityMapper', () => {
  let mapper: LayerSettingEntityMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LayerSettingEntityMapper]
    }).compile();

    mapper = module.get<LayerSettingEntityMapper>(LayerSettingEntityMapper);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  it('should convert LayerSettingEntity to LayerSetting', () => {
    const mockDate = new Date();
    const mockEntity = {
      name: 'test',
      setting: '' as IGisLayerSettings,
      created_by: 'test',
      created_date: mockDate,
      last_modified_by: mockDate.toString(),
      last_modified_date: mockDate
    } as LayerSettingEntity;

    const layerSetting = LayerSettingEntityMapper.fromEntity(mockEntity);
    expect(layerSetting).toEqual({
      name: 'test',
      setting: '' as IGisLayerSettings,
      createdBy: 'test',
      createDateTime: mockDate,
      lastChangedBy: mockDate.toString(),
      lastChangedDateTime: mockDate
    });
  });

  it('should convert LayerSetting to LayerSettingEntity', () => {
    const mockDate = new Date();
    const mockLayerSetting = {
      name: 'test',
      setting: '' as IGisLayerSettings,
      createdBy: 'test',
      createDateTime: mockDate,
      lastChangedBy: mockDate.toString(),
      lastChangedDateTime: mockDate
    } as LayerSetting;

    const layerSettingEntity = LayerSettingEntityMapper.toEntity(mockLayerSetting);
    expect(layerSettingEntity).toEqual({
      name: 'test',
      setting: '' as IGisLayerSettings,
      created_by: 'test',
      created_date: mockDate,
      last_modified_by: mockDate.toString(),
      last_modified_date: mockDate
    });
  });

  it('should convert LayerMetadataEntityList to LayerMetadataList', () => {
    const mockDate = new Date();
    const mockEntity = [
      {
        name: 'test',
        setting: '' as IGisLayerSettings,
        created_by: 'test',
        created_date: mockDate,
        last_modified_by: mockDate.toString(),
        last_modified_date: mockDate
      }
    ] as LayerSettingEntity[];

    const layerMetadata = LayerSettingEntityMapper.fromEntityList(mockEntity);
    expect(layerMetadata).toEqual([
      {
        name: 'test',
        setting: '' as IGisLayerSettings,
        createdBy: 'test',
        createDateTime: mockDate,
        lastChangedBy: mockDate.toString(),
        lastChangedDateTime: mockDate
      }
    ]);
  });
});
