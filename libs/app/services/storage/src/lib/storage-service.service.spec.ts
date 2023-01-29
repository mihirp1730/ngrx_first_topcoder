import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

import { StorageService, STORAGE_SERVICE_SERVICE_API_URL } from './storage-service.service';
import { of } from 'rxjs';

describe('StorageService', () => {
  let service: StorageService;
  let secureEnvironmentService: SecureEnvironmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: STORAGE_SERVICE_SERVICE_API_URL,
          useValue: 'http://storage-api'
        },
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'app-key'
              }
            }
          }
        }
      ]
    });
    service = TestBed.inject(StorageService);
    httpMock = TestBed.inject(HttpTestingController);
    secureEnvironmentService = TestBed.inject(SecureEnvironmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRequestOptions', () => {
    it('should return options with headers', () => {
      const options = (service as any).getRequestOptions();
      expect(options).toEqual({
        headers: {
          appKey: secureEnvironmentService.secureEnvironment.app.key,
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('saveItems', () => {
    it('should send items to backend', () => {
      const httpSpy = jest.spyOn((service as any).http, 'post').mockReturnValue(of());
      const getRequestOptionsSpy = jest.spyOn((service as any), 'getRequestOptions');
      const items = {
        'item-1': 'test value',
        'item-2': 'test value'
      };
      const options = {
        headers: {
          appKey: secureEnvironmentService.secureEnvironment.app.key,
          'Content-Type': 'application/json'
        }
      };
      service.saveItems(items);
      expect(getRequestOptionsSpy).toBeCalled();
      expect(httpSpy).toBeCalledWith(
        'http://storage-api/store',
        {
          items,
          includePartition: false
        },
        options
      );
    });
  });

  describe('getItems', () => {
    it('should get saved items', (done) => {
      const mockResponse = {
        'item-1': 'test value',
        'item-2': 'test value'
      };
      const keys = ['item-1', 'item-2'];
      const httpSpy = jest.spyOn((service as any).http, 'get');
      service.getItems(keys).subscribe(response => {
        expect(httpSpy).toBeCalled();
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne({
        method: 'GET',
        url: 'http://storage-api/store?keys=item-1&keys=item-2'
      }).flush(mockResponse);
    });

    it('should handle error', (done) => {
      const keys = ['item-1'];
      const httpSpy = jest.spyOn((service as any).http, 'get');
      service.getItems(keys).subscribe(response => {
        expect(httpSpy).toBeCalled();
        expect(response).toEqual({});
        done();
      });
      httpMock.expectOne({
        method: 'GET',
        url: 'http://storage-api/store?keys=item-1'
      }).error(new ErrorEvent('some error'));
    });
  });

});
