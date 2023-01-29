import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { BaseDataSource } from '../providers/base.data-source';
import { ServerOpportunityHostService } from './server-opportunity-host.service';

class MockBaseDataSource {
  getOpportunityRequestDetails = () => Promise.resolve();
}

describe('ServerOpportunityHostService', () => {
  let service: ServerOpportunityHostService;
  let mockBaseDataSource: MockBaseDataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerOpportunityHostService,
        {
          provide: BaseDataSource,
          useClass: MockBaseDataSource
        }
      ]
    }).compile();
    service = module.get(ServerOpportunityHostService);
    mockBaseDataSource = module.get(BaseDataSource);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getOpportunityRequestDetails', () => {
    it('should use the message from the attendee service', async () => {
      const vendorid = 'test';
      const response = {
        response: [
          {
            subscriptionRequestId: uuid()
          }
        ],
        header: 'abc'
      };
      jest.spyOn(mockBaseDataSource, 'getOpportunityRequestDetails').mockReturnValue(response as any);
      const result = await service.getOpportunitySubscriptionRequests('token', vendorid, { host: 'localhost' } as any);
      expect(result.response.length).toBe(1);
    });
  });
});
