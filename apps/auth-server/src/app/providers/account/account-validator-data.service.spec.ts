import { Test } from '@nestjs/testing';

import { AccountValidatorDataService } from './account-validator-data.service';
import { CONFIG_TOKEN, Config } from '../../modules/config';

function getConfigMock(): Config {
  return {
    ccmServiceHost: 'host',
    ccmAppKey: 'appKey',
    ccmAppCode: 'appCode'
  } as any;
}

class MockRequest {
  get = jest.fn();
}

describe('AccountValidatorDataService', () => {
  let service: AccountValidatorDataService;
  let requestMock: MockRequest;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [AccountValidatorDataService, { provide: CONFIG_TOKEN, useFactory: getConfigMock }]
    }).compile();

    service = app.get<AccountValidatorDataService>(AccountValidatorDataService);

    // Patch the HTTP request library ref with a mock.
    requestMock = (service as any)._http = new MockRequest();
  });

  describe('requestUserProfile', () => {
    it('should return the response only if the account.name exists', async () => {
      const authTokenMock = '123';
      const expectedResponse = { account: { name: 'foo' } };

      requestMock.get.mockResolvedValue(expectedResponse);
      const result = await service.requestUserProfile(authTokenMock);

      expect(result).toBe(expectedResponse);

      // Failure check.
      const failResponseMock = {};
      requestMock.get.mockReset();
      requestMock.get.mockResolvedValue(failResponseMock);

      let error;
      try {
        await service.requestUserProfile(authTokenMock);
      } catch (e) {
        error = e;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('requestUserSubscriptions', () => {
    it('should return the response', async () => {
      const authTokenMock = '123';
      const expectedResponse = [{}];

      requestMock.get.mockResolvedValue(expectedResponse);
      const result = await service.requestUserSubscriptions(authTokenMock);

      expect(result).toBe(expectedResponse);
    });

    it('should return an empty array ', async () => {
      const authTokenMock = '123';
      const mockResponse = {};
      const expectedResponse = [];

      requestMock.get.mockResolvedValue(mockResponse);
      const result = await service.requestUserSubscriptions(authTokenMock);

      expect(result).toEqual(expectedResponse);
    });
  });
});
