import { getTreeMissingMatchingNodeDefError } from '@angular/cdk/tree';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { SettingsService } from '@apollo/app/settings';
import { UserService } from '@delfi-gui/components';
import { of } from 'rxjs';

import { APP_BASE_URL, VendorAppService } from './vendor-app.service';

export const mockUserService = {
  getContext: jest.fn().mockReturnValue(of({ crmAccountId: 'test-account-id' }))
};
export const mockSettingsService = {
  getConsumerAppUrl: jest.fn().mockReturnValue(of('/test'))
};

describe('VendorAppService', () => {
  let service: VendorAppService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: SecureEnvironmentService,
          useValue: {
            secureEnvironment: {
              app: {
                key: 'AppKey'
              }
            }
          }
        },
        {
          provide: APP_BASE_URL,
          useValue: 'http://test'
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: SettingsService,
          useValue: mockSettingsService
        }
      ]
    });
    service = TestBed.inject(VendorAppService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('retrieveVendorProfile', () => {
    it('should make a GET call when retrieve vendor profile', (done) => {
      const url = 'http://test/data-vendors/dataVendorId/profile';
      const mockItem = {};
      service.retrieveVendorProfile('dataVendorId').subscribe(
        (response) => expect(response).toEqual(mockItem),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne({ url }).flush({ items: [mockItem] });
    });

    it('should return null on error', (done) => {
      const url = 'http://test/data-vendors/dataVendorId/profile';
      service.retrieveVendorProfile('dataVendorId').subscribe(
        (response) => expect(response).toEqual(null),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne({ url }).flush({}, { status: 400, statusText: 'Error' });
    });
  });

  describe('retrieveVendors', () => {
    it('should make a GET call when retrieve vendors', (done) => {
      const url = 'http://test/data-vendors/';
      const mockItem = [
        {
          dataVendorId: 'DataVendorId',
          name: 'Test Data Vendor'
        }
      ];
      service.retrieveDataVendors().subscribe(
        (response) => expect(response).toEqual(mockItem),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne({ url }).flush({ dataVendors: mockItem });
    });

    it('should return null on error', (done) => {
      const url = 'http://test/data-vendors/?billingAccountId=test-account-id';
      service.retrieveDataVendors(true).subscribe(
        (response) => expect(response).toEqual(null),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne({ url }).flush({}, { status: 400, statusText: 'Error' });
    });
  });

  describe('retrieveVendorContactPerson', () => {
    it('should make a GET call when retrieve vendors', (done) => {
      const dataVendorId = 'dataVendorId_1';
      const url = `http://test/data-vendors/${dataVendorId}/contact-person`;
      const mockItem = [
        {
          emailId: 'test@slb.com',
          displayName: 'Test Data Vendor'
        }
      ];
      service.retrieveVendorContactPerson(dataVendorId).subscribe(
        (response) => expect(response).toEqual(mockItem),
        (error) => {
          throw new Error(error);
        },
        () => done()
      );
      httpMock.expectOne(url).flush(mockItem);
    });
  });
  describe('retrieveAssociatedConsumerAppUrl', () => {
    it('should retrieve associated consumer url', () => {
      service.retrieveAssociatedConsumerAppUrl('vendorid').then((url) => {
        expect(url).toBe('/test');
      });
    });
  });
});
