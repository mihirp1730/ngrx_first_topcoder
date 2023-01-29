import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';
import { BaseDataSource } from '../providers/data-source';

import { ServerOpportunityAttendeeService } from './server-opportunity-attendee.service';

class MockBaseDataSource {
  getOpportunityDetails = () => Promise.resolve();
}

describe('ServerOpportunityAttendeeService', () => {
  let service: ServerOpportunityAttendeeService;
  let mockBaseDataSource: MockBaseDataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ServerOpportunityAttendeeService,
        {
          provide: BaseDataSource,
          useClass: MockBaseDataSource
        }
      ]
    }).compile();

    service = module.get(ServerOpportunityAttendeeService);
    mockBaseDataSource = module.get(BaseDataSource);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('getOpportunity', () => {
    it('should use the message from the attendee service', async () => {
      const opportunityId = uuid();
      const mockAuthorization = uuid();
      const response: any = { opportunityId };
      const userId = 'test@test.com';
      jest.spyOn(mockBaseDataSource, 'getOpportunityDetails').mockReturnValue(response as any);
      const result = await service.getOpportunity(mockAuthorization, userId, opportunityId, { host: 'localhost' } as any);
      expect(result.opportunityId).toBe(opportunityId);
    });
  });
});
