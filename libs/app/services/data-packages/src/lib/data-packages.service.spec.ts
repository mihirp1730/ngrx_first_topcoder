import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { v4 as uuid } from 'uuid';

import { DATA_PACKAGES_SERVICE_API_URL, DataPackagesService, GATEWAY_BASE_URL } from './data-packages.service';
import { ISavePackageProfileRequest, IUpdatePackageNameRequest } from './interfaces/data-packages.interface';

describe('DataPackagesService', () => {
  let service: DataPackagesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: DATA_PACKAGES_SERVICE_API_URL,
          useValue: 'http://data-packages-api'
        },
        {
          provide: GATEWAY_BASE_URL,
          useValue: 'http://test'
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
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
    service = TestBed.inject(DataPackagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the creation of the package', (done) => {
    const mockResponse = {};
    service.createDataPackage('name').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api').flush(mockResponse);
  });

  it('should call the data-packages endpoint to update profile name', (done) => {
    const mockResponse = {};
    const payload = {
      dataPackageId: 'testid',
      dataPackageName: 'test name'
    } as IUpdatePackageNameRequest;
    service.updatePackageName(payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api').flush(mockResponse);
  });

  it('should call the creation of the marketing representation', (done) => {
    const mockResponse = {};
    service.createMarketingRepresentation('package-id', { type: 'test', fileId: 'test-file' }).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/package-id/marketing-representations').flush(mockResponse);
  });

  describe('getMarketingRepresentations', () => {
    it('should return the marketing representations', (done) => {
      const mockResponse = { marketingRepresentations: [1] };
      service.getMarketingRepresentations('package-id').subscribe((response) => {
        expect(response).toEqual([1]);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id/marketing-representations').flush(mockResponse);
    });

    it('should return empty array on error', (done) => {
      service.getMarketingRepresentations('package-id').subscribe((response) => {
        expect(response).toEqual([]);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id/marketing-representations').flush({}, { status: 400, statusText: 'Error' });
    });
  });

  it('should call the deletion of the marketing representation', (done) => {
    const mockResponse = {};
    service.deleteMarketingRepresentation('marketingRepresentationId').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/marketing-representations/marketingRepresentationId').flush(mockResponse);
  });

  it('should call the publish of a package', (done) => {
    const mockResponse = {};
    service.publishPackage('package-id').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/package-id/publish').flush(mockResponse);
  });

  it('should call the data-items endpoint to associate the deliverable', (done) => {
    const mockResponse = {};
    service.associateDeliverable('package-id', { recordId: '', dataType: '' }).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/package-id/data-items').flush(mockResponse);
  });

  describe('getAssociateDeliverables', () => {
    it('should call the get data-items endpoint to get associated deliverables', (done) => {
      const mockResponse = { dataItems: [] };
      service.getAssociateDeliverables('package-id').subscribe((response) => {
        expect(response).toEqual([]);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id/data-items').flush(mockResponse);
    });

    it('should return empty array on error', (done) => {
      service.getAssociateDeliverables('package-id').subscribe((response) => {
        expect(response).toEqual([]);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id/data-items').flush({}, { status: 400, statusText: 'Error' });
    });
  });

  it('should call the deletion of a deliverable', (done) => {
    const mockResponse = null;
    service.deleteAssociatedDeliverables('packageId', 'dataItemId').subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/packageId/data-items/dataItemId').flush(mockResponse);
  });

  it('should call the data-package-profile endpoint to save profile info', (done) => {
    const mockResponse = {};
    service.savePackageProfile('package-id', {} as ISavePackageProfileRequest).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://data-packages-api/package-id/data-package-profile').flush(mockResponse);
  });

  describe('getDataPackage', () => {
    it('should call the data-packages GET endpoint to get the package info', (done) => {
      const mockResponse = {};
      service.getDataPackage('package-id').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id').flush(mockResponse);
    });

    it('should the errors in the data-packages GET endpoint', (done) => {
      const mockResponse = null;
      service.getDataPackage('package-id').subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne('http://data-packages-api/package-id').flush({}, { status: 404, statusText: 'Error' });
    });
  });

  describe('getPublishedDataPackageById', () => {
    it('should make a GET call', (done) => {
      const url = 'http://data-packages-api/published-data-packages?dataPackageId=dataPackageId';
      service.getPublishedDataPackageById('dataPackageId').subscribe(
        (response) =>
          expect(response).toEqual({
            id: 'test',
            dataPackageProfile: {
              profile: {}
            }
          }),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne({ url }).flush({
        dataPackages: [
          {
            id: 'test',
            dataPackageProfile: {
              profile: {}
            }
          }
        ]
      });
    });
  });

  it('should call get Data Packages', (done) => {
    const mockResponse = {
      totalResults: 0,
      results: []
    };
    service.getDataPackages().subscribe((response: []) => {
      expect(response.length).toEqual(0);
      done();
    });

    httpMock.expectOne('http://test/vendor/data-packages').flush(mockResponse);
  });

  describe('getConsumerDataPackage', () => {
    it('should handle getConsumerDataPackage\'s response', (done) => {
      const dataPackageId = uuid();
      const mockResponse = uuid();
      service.getConsumerDataPackage(dataPackageId).subscribe((response) => {
        expect(response).toBe(mockResponse);
        done();
      });
      httpMock.expectOne(`http://test/consumer/data-package/${dataPackageId}`).flush(mockResponse);
    });
  });

  it('should call delete Data Package', (done) => {
    const pkgId = 'pkg1';
    const mockResponse = {};
    service.deleteDraftPackage(pkgId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://data-packages-api/${pkgId}`).flush(mockResponse);
  });

  it('should call unpublish Package', (done) => {
    const pkgId = 'pkg_id';
    const mockResponse = {};
    service.unpublishPackage(pkgId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://data-packages-api/${pkgId}/unpublish`).flush(mockResponse);
  });
});
