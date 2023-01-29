import { ServerOpportunityHostController } from './server-opportunity-host.controller';
import { ServerOpportunityHostService } from '../services/server-opportunity-host.service';
import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';

class MockBaseDataSource {
  getOpportunitySubscriptionRequests = () => Promise.resolve();
}

describe('ServerOpportunityHostController', () => {
  let controller: ServerOpportunityHostController;
  let mockOpportunityHostRequestService: ServerOpportunityHostService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerOpportunityHostService,
          useClass: MockBaseDataSource
        }
      ],
      controllers: [ServerOpportunityHostController]
    }).compile();

    controller = module.get(ServerOpportunityHostController);
    mockOpportunityHostRequestService = module.get(ServerOpportunityHostService);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  describe('test', () => {
    it('should return test response', async () => {
      const mockRequest = {
        headers: {
          authorization: uuid()
        }
      } as any;
      const mockresponse = { response: {}, header: { 'correlation-id': 'abc' }, set: jest.fn(), send: jest.fn() } as any;
      const response = [{}] as any;
      const spy = jest
        .spyOn(mockOpportunityHostRequestService, 'getOpportunitySubscriptionRequests')
        .mockReturnValue(Promise.resolve(response as any));
      controller.getOpportunitySubscriptionRequests(mockRequest, mockresponse);
      expect(spy).toHaveBeenCalled();
    });
  });
});
