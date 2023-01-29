import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DATA_VENDORS_DETAILS, VendorAppService } from '@apollo/app/vendor';
import {
  APP_OPPORTUNITY_BASE_URL,
  GATEWAY_BASE_URL_FOR_OPPORTUNITY,
  OpportunityService,
  OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
  OPPORTUNITY_MAP_REP_SERVICE_API_URL,
  OPPORTUNITY_SERVICE_API_URL,
  OPPORTUNITY_SUBSCRIPTION_API_URL,
  OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL
} from './opportunity.service';

import { TestBed } from '@angular/core/testing';
import { SecureEnvironmentService } from '@apollo/app/secure-environment';
import { OpportunityType } from './interfaces/opportunity.interface';

describe('OpportunityService', () => {
  let service: OpportunityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: OPPORTUNITY_SERVICE_API_URL,
          useValue: 'http://opportunity-api'
        },
        {
          provide: OPPORTUNITY_SUBSCRIPTION_API_URL,
          useValue: 'http://opportunity-subscriptions-api'
        },
        {
          provide: OPPORTUNITY_SUBSCRIPTION_REQUEST_API_URL,
          useValue: 'http://opportunity-subscription-request'
        },
        {
          provide: OPPORTUNITY_MAP_REP_SERVICE_API_URL,
          useValue: 'http://opportunity-map-rep-api'
        },
        {
          provide: GATEWAY_BASE_URL_FOR_OPPORTUNITY,
          useValue: 'http://test'
        },
        {
          provide: APP_OPPORTUNITY_BASE_URL,
          useValue: 'http://opportunity-base-path'
        },
        {
          provide: OPPORTUNITY_ATTENDEE_SERVICE_API_URL,
          useValue: 'http://test/attendee'
        },
        {
          provide: DATA_VENDORS_DETAILS,
          useValue: [
            {
              dataVendorId: 'test_id',
              name: 'Test Data Vendor'
            }
          ]
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
        },
        {
          provide: VendorAppService,
          useValue: {
            dataVendors: [
              {
                dataVendorId: 'test_id',
                name: 'Test Data Vendor'
              }
            ]
          }
        }
      ]
    });
    service = TestBed.inject(OpportunityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call the creation of opportunity', (done) => {
    const mockResponse = {};
    const payload = {
      opportunityName: 'Opportunity Name',
      opportunityType: OpportunityType.Private
    };
    service.createOpportunity(payload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne('http://opportunity-api').flush(mockResponse);
  });

  describe('getOpportunityList', () => {
    it('should call the data-packages GET endpoint to get the opportunity list', (done) => {
      const mockResponse = {};
      const url = 'http://opportunity-api';
      service.getOpportunityList().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne(url).flush(mockResponse);
    });
  });

  describe('getOpportunityById', () => {
    it('should call the opportunity GET endpoint to get the opportunity', (done) => {
      const mockResponse = {};
      const oppId = 'id-1';
      const url = `http://opportunity-api/${oppId}`;
      service.getOpportunityById(oppId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne(url).flush(mockResponse);
    });
  });

  it('should call the save opportunity profile', (done) => {
    const oppId = 'opp_id_1';
    const mockResponse = {};
    const payload = {
      asset: ['test 1']
    };
    service.saveOpportunityProfile(oppId, payload as any).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-api/${oppId}/opportunity-profile`).flush(mockResponse);
  });

  it('should call the save saveOpportunitySteps method', (done) => {
    const mockResponse = {};
    const saveOpportunityProfile = {
      asset: ['test 1']
    };

    const saveOpportunityConfidentialProfile = {
      overview: 'test 1'
    };
    const oporPayload = {
      countries: ['country']
    };

    const opportunityVDRPayload = {
      accountName: 'Sample Account',
      departmentName: 'Marketing',
      vdrLink: 'www.vdr/lkjfoiei-9390=309'
    };
    service
      .saveOpportunitySteps(
        oporPayload as any,
        saveOpportunityProfile as any,
        saveOpportunityConfidentialProfile as any,
        opportunityVDRPayload as any,
        '1234'
      )
      .subscribe((response) => {
        expect(response).toEqual([{}, {}, {}, {}]);
        done();
      });
    httpMock.expectOne(`http://opportunity-api`).flush(mockResponse);
    httpMock.expectOne(`http://opportunity-api/1234/opportunity-profile`).flush(mockResponse);
    httpMock.expectOne(`http://opportunity-api/1234/confidential-opportunity-profile`).flush(mockResponse);
    httpMock.expectOne(`http://opportunity-api/1234/opportunity-vdr`).flush(mockResponse);
  });

  it('should call the save opportunity confidential profile', (done) => {
    const oppId = 'opp_id_1';
    const mockResponse = {};
    const payload = {
      overview: 'test 1'
    };
    service.saveOpportunityConfidentialProfile(oppId, payload as any).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-api/${oppId}/confidential-opportunity-profile`).flush(mockResponse);
  });

  it('should call the save opportunity', (done) => {
    const mockResponse = {};
    const payload = {
      countries: ['country']
    };
    service.saveOpportunity(payload as any).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-api`).flush(mockResponse);
  });

  it('should call delete opportunity', (done) => {
    const oppId = 'opp_id_1';
    const mockResponse = {};
    service.deleteOpportunity(oppId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-api/${oppId}`).flush(mockResponse);
  });

  it('should call unpublish opportunity', (done) => {
    const oppId = 'opp_id_1';
    const mockResponse = {};
    service.unPublishOpportunity(oppId).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-api/${oppId}/unpublish`).flush(mockResponse);
  });

  it('should call the creation of the map representation for opportunity', (done) => {
    const mockResponse = {};
    const oppId = 'op-id';
    const fileId = 'test_file_id';
    service.createMarketingRepresentation(oppId, { type: 'Opportunity', fileId }).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    httpMock.expectOne(`http://opportunity-map-rep-api/${oppId}/map-representations`).flush(mockResponse);
  });

  it('should call the creation of the subscription for opportunity', (done) => {
    const mockResponse = {
      opportunitySubscriptionId: 'opportunitySubscriptionId'
    };
    const opportunitySubscriptionPayload = {
      opportunityId: 'op-id',
      subscriptionRequestId: 'subscriptionRequestId',
      attendeeId: 'attendeeId',
      accessLevels: ['test'],
      startDate: 'start-date',
      endDate: 'end-date',
      description: 'message'
    };
    service.createSubscription(opportunitySubscriptionPayload).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });
    httpMock.expectOne(`http://opportunity-subscriptions-api`).flush(mockResponse);
  });

  describe('addVdrToOpportunity', () => {
    it('should save the VDR link for opportunity', (done) => {
      const mockResponse = {};
      const opportunityId = 'test-id';
      const opportunityVDRPayload = {
        accountName: 'Sample Account',
        departmentName: 'Marketing',
        vdrLink: 'www.vdr/lkjfoiei-9390=309'
      };
      service.addVdrToOpportunity(opportunityId, opportunityVDRPayload).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne(`http://opportunity-api/${opportunityId}/opportunity-vdr`).flush(mockResponse);
    });
  });

  describe('getOpportunityRequestList', () => {
    it('should call the opportunity subscription GET endpoint to get the subscription request list', (done) => {
      const mockResponse = [
        {
          opportunityId: 'test-id',
          opportunityName: 'test opportunity',
          status: 'Pending'
        }
      ];

      const url = 'http://test/opportunity-subscription-request';
      service.getOpportunityRequestList().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne(url).flush(mockResponse);
    });
  });

  describe('getOpportunitySubscriptions', () => {
    it('should call the opportunity subscriptions GET endpoint to get the subscriptions', (done) => {
      const mockResponse = {
        items: [
          {
            opportunityId: 'test 1',
            username: 'user 1',
            opportunityName: 'opp_name_1',
            accessDetails: [
              {
                accessLevel: 'confidential_information'
              },
              {
                accessLevel: 'xyz'
              }
            ]
          }
        ]
      };

      const url = 'http://opportunity-subscriptions-api';
      service.getOpportunitySubscriptions().subscribe((response) => {
        expect(response).toEqual(mockResponse.items);
        done();
      });
      httpMock.expectOne(url).flush(mockResponse);
    });
  });

  describe('rejectOpportuntityRequest', () => {
    it('should reject the opportunity request', (done) => {
      const mockResponse = {};
      const subscriptionRequestId = 'test-id';
      const payload = {
        rejectionReason: 'test'
      };
      service.rejectOpportunityRequest(payload, subscriptionRequestId).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      httpMock.expectOne(`http://opportunity-subscription-request/${subscriptionRequestId}/reject`).flush(mockResponse);
    });
  });
  describe('updateSubscription', () => {
    it('should call update subscription', (done) => {
      const mockResponse = { opportunitySubscriptionId: 'subscription_id' };
      const payload = {
        subscriptionRequestId: 'req_id_1'
      };
      service.updateSubscription(payload as any).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne(`http://opportunity-subscriptions-api`).flush(mockResponse);
    });
  });

  describe('publicPublishedOpportunity', () => {
    it('should call getPublicPublishedOpportunities', (done) => {
      const mockResponse = {};
      service.getPublicPublishedOpportunities().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne(`http://test/attendee`).flush(mockResponse);
    });
  });

  describe('publicPublishedOpportunity', () => {
    it('should call getPublicPublishedOpportunities', (done) => {
      const mockResponse = {};
      service.getPublicPublishedOpportunities().subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

      httpMock.expectOne(`http://test/attendee`).flush(mockResponse);
    });
  });

  describe('getOpportunityConsumerUrl', () => {
    it('should call getOpportunityConsumerUrl', () => {
      const id = 'opp-id';
      const url = service.getOpportunityConsumerUrl(id);
      expect(url).toBe('http://opportunity-base-path/opportunity/opp-id');
    });
  });
});
