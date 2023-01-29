import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';

import { SelectionPersistenceService, PERSISTED_COLLECTION_SERVICE_API_URL } from './selection-persistence.service';

describe('SelectionPersistenceService', () => {
  let service: SelectionPersistenceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: PERSISTED_COLLECTION_SERVICE_API_URL,
          useValue: 'http://discovery-api'
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
    service = TestBed.inject(SelectionPersistenceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('saveSelection', () => {
    it('should persist collection', () => {
      const requestOptions = (service as any).getRequestOptions();
      requestOptions.responseType = 'text';
      const httpSpy = jest.spyOn((service as any).httpClient, 'post').mockImplementation();
      const payload = {
        name: 'test name',
        desc: 'test description',
        recordIds: []
      };
      service.saveSelection(payload);
      expect(httpSpy).toBeCalledWith('http://discovery-api/persisted-collection', payload, requestOptions);
    });
  });

  describe('saveSelection', () => {
    it('should persist collection', () => {
      const requestOptions = (service as any).getRequestOptions();
      requestOptions.responseType = 'text';
      const httpSpy = jest.spyOn((service as any).httpClient, 'post').mockImplementation();
      const payload = {
        name: 'test name',
        desc: 'test description',
        recordIds: []
      };
      service.saveSelection(payload);
      expect(httpSpy).toBeCalledWith('http://discovery-api/persisted-collection', payload, requestOptions);
    });
  });

  describe('getUserCollections', () => {
    it(`should get user's collection`, (done) => {
      const mockResponse = [
        'some-id',
        'some-id-2'
      ];
      service.getUserCollections().subscribe(response => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne('http://discovery-api/persisted-collection').flush(mockResponse);
    });
  });
});
