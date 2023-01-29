import { Test } from '@nestjs/testing';
import { noop } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ServerOpportunityAttendeeService } from '../services/server-opportunity-attendee.service';
import { ServerOpportunityAttendeeController } from './server-opportunity-attendee.controller';

jest.mock('jwt-decode', () => jest.fn(() => {
  return { email: 'test@slb.com' }
}));

class MockServerDataPackagesConsumerService {
  getOpportunity = noop
}

describe('ServerOpportunityAttendeeController', () => {
  let controller: ServerOpportunityAttendeeController;
  let mockServerOpportunityAttendeeService: ServerOpportunityAttendeeService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerOpportunityAttendeeService,
          useClass: MockServerDataPackagesConsumerService
        }
      ],
      controllers: [ServerOpportunityAttendeeController]
    }).compile();

    controller = module.get(ServerOpportunityAttendeeController);
    mockServerOpportunityAttendeeService = module.get(ServerOpportunityAttendeeService);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  describe('opportunity', () => {
    it('should return ServerOpportunityAttendeeService\'s getOpportunity response', async () => {
      const opportunityId = uuid();
      const mockRequest = {
        headers: {
          authorization: uuid()
        }
      } as any;
      const response = { opportunityId };
      const spy = jest.spyOn(mockServerOpportunityAttendeeService, 'getOpportunity').mockReturnValue(response as any);
      const result = await controller.getOpportunity(mockRequest, opportunityId);
      expect(spy).toHaveBeenCalled();
      expect(result).toBe(response);
    });
  });
});
