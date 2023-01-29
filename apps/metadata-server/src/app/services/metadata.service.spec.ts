import { ICategory, IConfigOptions } from '@apollo/api/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';

import { MetadataFileReaderService, MetadataService } from '../services/metadata.service';

const mockFileReaderService = {
  readDir: jest.fn(() => ['xchange.json']),
  readFile: jest.fn((_: string, filename: string) => {
    let response = {};

    if (filename.includes('xchange')) {
      response = {
        name: 'xchange',
        mapLargeTable: 'slb/xchange',
        displayName: 'xchange',
        displayInMap: true,
        attributes: [
          {
            name: 'Shape',
            type: 'geo.poly'
          }
        ]
      };
    }

    return JSON.stringify(response);
  })
};

describe('MetadataService tests', () => {
  let provider: MetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: MetadataFileReaderService,
          useValue: mockFileReaderService
        },
        {
          provide: MetadataService,
          inject: [MetadataFileReaderService],
          useFactory: (fileReaderService) => new MetadataService(fileReaderService, {
            sourceFileFolder: 'test-metadata-path'
          } as IConfigOptions)
        }
      ]
    }).compile();

    provider = module.get<MetadataService>(MetadataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return only those properties that are specified', () => {
    const data = provider.getLayers();

    expect(data.length).toBe(1);
    expect(data[0]).toEqual({
      name: 'xchange',
      mapLargeTable: 'slb/xchange',
      displayName: 'xchange',
      displayInMap: true,
      attributes: [
        {
          name: 'Shape',
          type: 'geo.poly'
        }
      ]
    });
  });

  it('should only call fs.readdirSync once', () => {
    expect(mockFileReaderService.readDir).toBeCalledTimes(1);
  });

  it('should only call fs.readFileSync for each file in directory', () => {
    expect(mockFileReaderService.readFile).toBeCalledTimes(1);
  });

  it('should not call fs.readdirSync or fs.readFileSync during getLayers', () => {
    jest.clearAllMocks();
    provider.getLayers();
    expect(mockFileReaderService.readDir).not.toHaveBeenCalled();
    expect(mockFileReaderService.readFile).not.toHaveBeenCalled();
  });

  it('should call getMarketingRepresentations', () => {
    jest.clearAllMocks();
    const res = provider.getMarketingLayers();
    expect(res.length).toBe(1);
  });

  it('should call getLayer', () => {
    jest.clearAllMocks();
    let res = provider.getLayer('xchange');
    expect(res).toBeTruthy();
    res = provider.getLayer('test');
    expect(res).toBeFalsy();
  });

  it('should call postLayer', () => {
    jest.clearAllMocks();
    const testLayer = {
      name: 'testLayer',
      mapLargeTable: 'slb/xchange',
      displayName: 'xchange',
      displayInMap: true,
      attributes: [
        {
          name: 'Shape',
          type: 'geo.poly'
        }
      ]
    };
    provider.postLayer(testLayer as ICategory);
    expect(provider.getLayers().length).toBe(2);
    expect(provider.getLayers()[1].name).toBe('testLayer');
    provider.postLayer(testLayer as ICategory);
    expect(provider.getLayers().length).toBe(2);
  });

  it('should get current layer names', () => {
    const result = provider.getPublicLayers();
    expect(result).toEqual(['xchange']);
  });
});
