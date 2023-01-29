import { Test } from '@nestjs/testing';
import { v4 as uuid } from 'uuid';

import { BaseDataSource } from '../providers/data-source';
import { ServerDataPackagesVendorService } from './server-data-packages-vendor.service';

class MockBaseDataSource {
  queryPackages = () => Promise.resolve()
}

describe('ServerDataPackagesVendorService', () => {
  let service: ServerDataPackagesVendorService;
  let mockBaseDataSource: MockBaseDataSource;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: BaseDataSource,
          useClass: MockBaseDataSource
        },
        ServerDataPackagesVendorService
      ]
    }).compile();
    service = module.get(ServerDataPackagesVendorService);
    mockBaseDataSource = module.get(BaseDataSource);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('queryResults', () => {
    it('should return a results response', async () => {
      const mockResponse = [];
      const mockUserId = uuid();
      const mockBillingAccountId = uuid();
      const mockAuthorization = uuid();
      const mockBody = {
        filters: {
          status: {
            value: null
          },
          region: {
            value: null
          },
          dataType: {
            value: null
          }
        }
      }
      const spy = jest.spyOn(mockBaseDataSource, 'queryPackages').mockReturnValue(mockResponse as any);
      const result = await service.queryResults(mockUserId, mockBillingAccountId, mockAuthorization, mockBody);
      expect(spy).toHaveBeenCalledWith(mockUserId, mockBillingAccountId, mockAuthorization, mockBody);
      expect(result).toEqual({
        totalResults: 0,
        results: []
      });
    });
  });

});
