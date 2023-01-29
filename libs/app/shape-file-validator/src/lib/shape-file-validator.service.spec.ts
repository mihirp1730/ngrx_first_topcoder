import { TestBed } from '@angular/core/testing';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { MetadataService } from '@apollo/app/metadata';
import { of } from 'rxjs';

import { ShapeFileValidatorService, SHAPE_FILE_VALIDATOR_WORKER_FACTORY } from './shape-file-validator.service';

class mockWorkerFactory {
  addEventListener = jest.fn();
  postMessage = jest.fn();
  onmessage = jest.fn();
  onmessageerror = jest.fn();
  terminate = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
  onerror = jest.fn();
}

class mockShapeFileProcessor {
  load = jest.fn().mockResolvedValue({ geometry: 15 });
}
jest.mock('comlink', () => {
  return {
    wrap: () => mockShapeFileProcessor
  }
});
window.Worker = mockWorkerFactory;

export const mockMetadataService = {
  marketingLayers$: of([{
    layerName: 'datatype_1',
    shapeType: 'abc.poly'
  }])
}

describe('ShapeFileValidatorService', () => {
  let service: ShapeFileValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SHAPE_FILE_VALIDATOR_WORKER_FACTORY,
          useValue: new Worker('', { type: 'module'})
        },
        {
          provide: MetadataService,
          useValue: mockMetadataService
      }
      ]
    });
    service = TestBed.inject(ShapeFileValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initValidation', () => {
    it('should return true for valid file for polygon', async() => {
      const mockFile = {
        name: 'test.shp.zip',
        type: 'zip'
      } as File;
      const selectedDataType = 'datatype_1';
      const results = await service.initValidation(mockFile, selectedDataType);
      expect(results).toBe(true);
    });
  });

  describe("validateGeometry", () => {
    it('should validate polygon', () => {
      const filteredShapeType = 'poly';
      const response = { geometry: 15 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result).toBeUndefined();
    });
    it('should return error message for polygon', () => {
      const filteredShapeType = 'poly';
      const response = { geometry: 100 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result.search('Polygon')).toBeGreaterThan(0);
    });
    it('should validate point', () => {
      const filteredShapeType = 'dot';
      const response = { geometry: 11 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result).toBeUndefined();
    });
    it('should return error message for point', () => {
      const filteredShapeType = 'dot';
      const response = { geometry: 100 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result.search('Point')).toBeGreaterThan(0);
    });
    it('should validate line', () => {
      const filteredShapeType = 'line';
      const response = { geometry: 13 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result).toBeUndefined();
    });
    it('should return error message for line', () => {
      const filteredShapeType = 'line';
      const response = { geometry: 100 };
      const result = service.validateGeometry(filteredShapeType, response);
      expect(result.search('Line')).toBeGreaterThan(0);
    });
  });
});
