import { ISauth } from '@apollo/server/jwt-token-middleware';
import { Test } from '@nestjs/testing';
import { noop } from 'lodash';
import { v4 as uuid } from 'uuid';

import { ServerDataPackagesVendorService } from '../services/server-data-packages-vendor.service';
import { ServerDataPackagesVendorController } from './server-data-packages-vendor.controller';

class MockServerDataPackagesVendorService {
  getFilters = noop;
  queryResults = noop;
}

describe('ServerDataPackagesVendorController', () => {
  let controller: ServerDataPackagesVendorController;
  let serverDataPackagesVendorService: ServerDataPackagesVendorService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ServerDataPackagesVendorService,
          useClass: MockServerDataPackagesVendorService
        }
      ],
      controllers: [ServerDataPackagesVendorController]
    }).compile();
    controller = module.get(ServerDataPackagesVendorController);
    serverDataPackagesVendorService = module.get(ServerDataPackagesVendorService);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  describe('queryResults', () => {
    it('should return from the service', async () => {
      const mockRequest = {
        headers: {
          authorization: uuid()
        }
      } as any;
      const mockSession = {
        email: uuid()
      } as unknown as ISauth;
      const mockBillingAccountId = uuid();
      const mockResponse = uuid();
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
      jest.spyOn(serverDataPackagesVendorService, 'queryResults').mockReturnValue(mockResponse as any);
      expect(await controller.queryResults(mockRequest, mockSession, mockBillingAccountId, mockBody))
        .toBe(mockResponse);
    });
  });
});
