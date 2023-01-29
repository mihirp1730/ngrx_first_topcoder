import { DELFI_USER_CONTEXT } from '@apollo/app/delfi-gui-auth-config';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DataSubscriptionService, DATA_SUBSCRIPTION_SERVICE_API_URL } from './data-subscription.service';

describe('DataSubscriptionService', () => {
  let service: DataSubscriptionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: DATA_SUBSCRIPTION_SERVICE_API_URL,
          useValue: 'http://data-subscription-api'
        },
        {
          provide: DELFI_USER_CONTEXT,
          useValue: {
            crmAccountId: 'test-account-id'
          }
        }
      ]
    });
    service = TestBed.inject(DataSubscriptionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the publish of a package', (done) => {
    const mockResponse = { items: [] };
    service.getRequests().subscribe(response => {
      expect(response).toEqual([]);
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscription-requests').flush(mockResponse);
  });

  it('should call create a subscription endpoint', (done) => {
    const mockResponse = {};
    const postBody = {
      dataPackageId: '',
      subscriptionRequestId: '',
      subscriptionPrice: 1200,
      subscriptionDuration: 12,
      startDate: '',
      endDate: '',
      transactionDetail: {
        transactionId: '',
      },
      customerDetail: {
        customerId: '',
        customerName: '',
        companyName: ''
      }
    }
    service.createSubscription(postBody).subscribe(response => {
      expect(response).toEqual({});
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscriptions').flush(mockResponse);
  });

  it('should call the get manage subscriptions api', (done) => {
    const mockResponse = { items: [] };
    service.getManageSubscription({ limit: 0, after: 0, before: 0 }).subscribe(response => {
      expect(response).toEqual([]);
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscriptions').flush(mockResponse);
  });

  it('should create a subscription request', (done) => {
    const mockResponse = {};
    const dataPackageId = 'testId';
    const comment = 'comment';
    const companyName = 'companyName';
    service.createSubscriptionRequests(dataPackageId, comment, companyName).subscribe((response) => {
      expect(response).toEqual({});
      done();
    });

    httpMock.expectOne('http://data-subscription-api/data-subscription-requests').flush(mockResponse);
  });
});
