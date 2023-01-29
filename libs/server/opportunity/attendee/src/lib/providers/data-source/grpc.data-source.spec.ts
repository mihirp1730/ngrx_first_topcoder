import { HttpService } from '@nestjs/axios';
import { noop } from 'lodash';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';

import { OpportunityStatus } from '../../interfaces/interface';
import { GrpcDataSource } from './grpc.data-source';

class MockOpportunityService {
  getPublicOpportunity = noop;
}

class MockHttpClient {
  get = jest.fn();
}

describe('GrpcDataSource', () => {
  let dataSource: GrpcDataSource;
  let mockLoadSyncRef: any;
  let existsSyncFactoryRef: any;
  let mockLoadPackageDefinitionRef: any;
  let httpService: MockHttpClient;

  beforeEach(() => {
    mockLoadSyncRef = () => null;
    existsSyncFactoryRef = () => true;
    mockLoadPackageDefinitionRef = {
      com: {
        slb: {
          xchange: {
            resource: {
              OpportunityService: MockOpportunityService
            }
          }
        }
      }
    };
    httpService = new MockHttpClient();
    dataSource = new GrpcDataSource(
      'grpcHost',
      'grpcPort',
      'protoPath',
      () => existsSyncFactoryRef,
      () => mockLoadSyncRef,
      () => () => mockLoadPackageDefinitionRef,
      httpService as unknown as HttpService
    );
  });

  it('should be defined', () => {
    expect(dataSource).toBeTruthy();
  });

  describe('init', () => {
    it('should reject with a missing service', (done) => {
      mockLoadPackageDefinitionRef = {};
      dataSource.init().catch((error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
    it('should reject with a missing proto file', (done) => {
      existsSyncFactoryRef = () => false;
      dataSource.init().catch((error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
    it('should return with a data source instance', (done) => {
      dataSource.init().then((ref) => {
        expect(ref).toBe(dataSource);
        done();
      });
    });
  });

  describe('getOpportunityDetails', () => {
    beforeEach(async () => {
      await dataSource.init();
    });

    it('should return opportunity details', (done) => {
      const mockAuthorization = uuid();
      const opportunityId = uuid();
      const opportunity = {
        opportunity_id: uuid()
      };
      const requests = {
        subscriptionRequestId: uuid()
      };
      const userId = 'test@test.com';
      const opportunitySubscriptionId = uuid();
      const subscriptions = [{ opportunitySubscriptionId }];

      jest.spyOn(dataSource, 'getPublicOpportunity').mockReturnValue(Promise.resolve(opportunity as any));
      jest.spyOn(dataSource, 'getOpportunityRequests').mockReturnValue(Promise.resolve(requests as any));
      jest.spyOn(dataSource, 'getOpportunitySubscriptions').mockReturnValue(Promise.resolve(subscriptions as any));
      dataSource.getOpportunityDetails(mockAuthorization, userId, opportunityId, { host: 'localhost' } as any).then((res) => {
        expect(res).toBeTruthy();
        done();
      });
    });
  });

  describe('getPublicOpportunity', () => {
    beforeEach(async () => {
      await dataSource.init();
    });
    it('should reject with a missing client', (done) => {
      dataSource.client = null;
      const opportunityId = uuid();
      dataSource.getPublicOpportunity(opportunityId, { set: jest.fn() } as any).catch((error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
    it('should reject with any client error', (done) => {
      const opportunityId = uuid();
      jest.spyOn(dataSource.client, 'getPublicOpportunity').mockImplementationOnce(() => {
        throw new Error(uuid());
      });
      dataSource.getPublicOpportunity(opportunityId, { set: jest.fn() } as any).catch((error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
    it('should return with a value', (done) => {
      const opportunityId = uuid();
      (dataSource.client as any).getPublicOpportunity = (args, metadata, callback) => {
        callback(null, {
          opportunity: {
            opportunityId,
            opportunity_status: OpportunityStatus.Published
          }
        });
      };
      dataSource.getPublicOpportunity(opportunityId, { set: jest.fn() } as any).then((response) => {
        expect(response).toBeTruthy();
        done();
      });
    });

    it('should not return with a value for unpublished opportunity', (done) => {
      const opportunityId = uuid();
      (dataSource.client as any).getPublicOpportunity = (args, metadata, callback) => {
        callback(null, {
          opportunity: {
            opportunityId,
            opportunity_status: 'Unpublished'
          }
        });
      };
      dataSource.getPublicOpportunity(opportunityId, { set: jest.fn() } as any).catch((error) => {
        expect(error).toBeTruthy();
        done();
      });
    });
  });

  describe('getOpportunityRequests', () => {
    it('should get opportunity requests', async () => {
      const subscriptionRequestId = uuid();
      const requests = { data: { items: [{ subscriptionRequestId }] } };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(requests as any));

      const res = await dataSource.getOpportunityRequests('token', { host: 'localhost' } as any);
      expect(res).toBe(requests.data.items);
    });
  });

  describe('getOpportunitySubscriptions', () => {
    it('should get opportunity subscriptions', async () => {
      const opportunitySubscriptionId = uuid();
      const requests = { data: { items: [{ opportunitySubscriptionId }] } };
      jest.spyOn(httpService, 'get').mockImplementation(() => of(requests as any));

      const res = await dataSource.getOpportunitySubscriptions('token', { host: 'localhost' } as any);
      expect(res).toBe(requests.data.items);
    });
  });

  describe('generateResponse', () => {
    const input = {
      opportunity_id: uuid(),
      opportunity_profile: {
        media: [
          {
            file_id: 'file_id',
            file_name: 'fileName'
          }
        ],
        documents: [
          {
            file_id: 'file_id',
            file_name: 'fileName'
          }
        ]
      },
      confidential_opportunity_profile: {
        media: [
          {
            file_id: 'file_id',
            file_name: 'fileName'
          }
        ],
        documents: [
          {
            file_id: 'file_id',
            file_name: 'fileName'
          }
        ]
      }
    };
    it('should generate response', () => {
      const result = dataSource.generateResponse(input as any, [], []);
      expect(result.opportunityId).toBe(input.opportunity_id);
    });
    it('should generate response with requests', () => {
      const subscriptionRequestId = uuid();
      const requests = [{ subscriptionRequestId }];
      const result = dataSource.generateResponse(input as any, requests as any, []);
      expect(result.requests.length).toBe(1);
    });

    it('should generate response with subscriptions', () => {
      const opportunitySubscriptionId = uuid();
      const subscriptions = [{ opportunitySubscriptionId }];
      const result = dataSource.generateResponse(input as any, [], subscriptions as any);
      expect(result.subscriptions.length).toBe(1);
    });
  });
});
