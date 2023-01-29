import { TestBed } from '@angular/core/testing';
import { GeoJsonFileValidatorService, GEOJSON_FILE_VALIDATOR_WORKER_FACTORY } from './geojson-file-validator.service';

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

class mockGeojsonFileProcessor {
  load = jest.fn().mockResolvedValue({ valid: true, message: '' });
}
jest.mock('comlink', () => {
  return {
    wrap: () => mockGeojsonFileProcessor
  };
});
window.Worker = mockWorkerFactory;

describe('GeoJsonFileValidatorService', () => {
  let service: GeoJsonFileValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GEOJSON_FILE_VALIDATOR_WORKER_FACTORY,
          useValue: new Worker('', { type: 'module' })
        }
      ]
    });
    service = TestBed.inject(GeoJsonFileValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initValidation', () => {
    it('should return true for valid file for polygon', async () => {
      const mockFile = {
        name: 'test.geojson',
        type: 'geojson'
      } as File;
      const selectedDataType = 'Opportunity';
      const results = await service.initValidation(mockFile, selectedDataType);
      expect(results).toBe(true);
    });
  });

  describe('load and validate shape file', () => {
    it('should throw validation error', async () => {
      const selectedDataType = 'Opportunity';
      const mockFile = new File([new ArrayBuffer(1234)], 'test.geojson', { type: 'applcation/geo+json' });
      await service.initValidation(mockFile, selectedDataType).catch((err) => {
        expect(err.message).toContain('This geojson contains invalid data!. Please upload a valid one');
      });
    });
  });
});
