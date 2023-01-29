import { TestBed } from '@angular/core/testing';
import { GeojsonFileProcessor } from './geojson-file-processor';

class MockFileReaderFactory {
  onerror = jest.fn();
  onload = jest.fn();
  onloadend = jest.fn();
  readAsText = jest.fn();
}

class MockFileFactory {}

describe('GeojsonFileProcessor', () => {
  let geojsonFileProcessor: GeojsonFileProcessor;
  let mockFileReaderFactory: MockFileReaderFactory;
  let mockFileFactory: MockFileFactory;

  beforeEach(() => {
    mockFileReaderFactory = new MockFileReaderFactory();
    mockFileFactory = new MockFileFactory();

    TestBed.configureTestingModule({
      providers: [
        GeojsonFileProcessor,
        {
          provide: FileReader,
          useValue: () => mockFileReaderFactory
        },
        {
          provide: File,
          useValue: () => mockFileFactory
        }
      ]
    });
    geojsonFileProcessor = TestBed.inject(GeojsonFileProcessor);
  });

  it('should be created', () => {
    expect(geojsonFileProcessor).toBeTruthy();
  });

  describe('Load and validate the geojson file', () => {
    it('should call "load()" method with given mock-file and reject with error message', () => {
      const mockFile = new File([new ArrayBuffer(1234)], 'test.geojson', { type: 'applcation/geo+json' });
      const shapeType = 'geo.poly';
      expect(geojsonFileProcessor.load(mockFile, shapeType)).rejects.toMatchObject({
        valid: false,
        message: 'This geojson contains invalid data!. Please upload a valid one'
      });
    });

    it('should call "validateGeojson" method with given mock-file and give validity as false', () => {
      const mockFile = new File([new ArrayBuffer(1234)], 'test.geojson', { type: 'applcation/geo+json' });
      const shapeType = 'geo.poly';
      geojsonFileProcessor.validateGeojson(mockFile, shapeType);
      expect(geojsonFileProcessor.response.valid).toBeFalsy;
    });

    it('should call "validateGeojson" method with given mock-data and resolve to true', () => {
      const jsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-5525859494526976' },
            geometry: {
              type: 'Polygon'
            }
          }
        ]
      };
      const shapeType = 'geo.poly';
      geojsonFileProcessor.validateGeojson(jsonData, shapeType);
      expect(geojsonFileProcessor.response.valid).toBeTruthy;
    });

    it('should call "validateGeojson" method with given mock-data and resolve to true', () => {
      const jsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-5525859494526976' },
            geometry: {
              type: 'Point'
            }
          }
        ]
      };
      const shapeType = 'geo.dot';
      geojsonFileProcessor.validateGeojson(jsonData, shapeType);
      expect(geojsonFileProcessor.response.valid).toBeTruthy;
    });

    it('should call "validateGeojson" method with given mock data and reject with custome error message', () => {
      const jsonData2 = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-5525859494526976' },
            geometry: {
              type: 'Point'
            }
          }
        ]
      };
      const shapeType = 'geo.poly';
      geojsonFileProcessor.validateGeojson(jsonData2, shapeType);
      expect(geojsonFileProcessor.response.message).toEqual(
        'This geojson file contains invalid geometry type!. Allowed types are Polygon and MultiPolygon only'
      );
    });

    it('should call "validateGeojson" method with given mock data and reject with custome error message', () => {
      const jsonData2 = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-5525859494526976' },
            geometry: {
              type: 'Polygon'
            }
          }
        ]
      };
      const shapeType = 'geo.dot';
      geojsonFileProcessor.validateGeojson(jsonData2, shapeType);
      expect(geojsonFileProcessor.response.message).toEqual(
        'This geojson file contains invalid geometry type!. Allowed types are Point and MultiPoint only'
      );
    });
    
    it('should call "validateGeojson" method with given mock data and reject with custome error message', () => {
      const jsonData2 = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-3525859494526976' },
            geometry: {
              type: 'Polygon'
            }
          }
        ]
      };
      const shapeType = 'geo.line';
      geojsonFileProcessor.validateGeojson(jsonData2, shapeType);
      expect(geojsonFileProcessor.response.message).toEqual(
        'This geojson file contains invalid geometry type!. Allowed types is Line only'
      );
    });

    it('should call "validateGeojson" method with given mock-data and resolve to true', () => {
      const jsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { marketingRepresentationId: 'MR-4525859494526976' },
            geometry: {
              type: 'LineString'
            }
          }
        ]
      };
      const shapeType = 'geo.line';
      geojsonFileProcessor.validateGeojson(jsonData, shapeType);
      expect(geojsonFileProcessor.response.valid).toBeTruthy;
    });

  });
});
