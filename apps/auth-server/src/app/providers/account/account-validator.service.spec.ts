import { Test } from '@nestjs/testing';
import * as NodeCache from 'node-cache';

import { AccountValidatorService } from './account-validator.service';
import { CONFIG_TOKEN, Config } from '../../modules/config';
import { UserProfile } from './user.models';
import { AccountValidatorDataService } from './account-validator-data.service';
import { Logger } from '@nestjs/common';

function getConfigMock(): Config {
  return {} as any;
}

class MockAccountValidatorDataService {
  requestUserProfile = jest.fn();
  requestUserSubscriptions = jest.fn();
}

class MockLogger {
  log = jest.fn();
}

class MockNodeCache {}

describe('AccountValidatorService', () => {
  let service: AccountValidatorService;
  let dataService: AccountValidatorDataService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [
        AccountValidatorService,
        { provide: AccountValidatorDataService, useClass: MockAccountValidatorDataService },
        { provide: CONFIG_TOKEN, useFactory: getConfigMock },
        { provide: Logger, useClass: MockLogger },
        { provide: NodeCache, useClass: MockNodeCache }
      ]
    }).compile();

    service = app.get<AccountValidatorService>(AccountValidatorService);
    dataService = app.get<AccountValidatorDataService>(AccountValidatorDataService);
  });

  // TODO: move this to abstract class tests
  describe('cache-only operations', () => {
    it('should invalidate cache while using _getCacheKey', () => {
      const nodeCache = new NodeCache();
      const mockUserId = 'test';

      const cacheKey = (service as any)._getCacheKey(mockUserId);
      nodeCache.set(cacheKey, 'abc');

      (service as any)._nodeCache = nodeCache;
      service.invalidateOnCache(mockUserId);

      expect(nodeCache.get(cacheKey)).toBeUndefined();
    });
  });

  it('should validate try to call _getAndCacheValidationResult()', async () => {
    const _getAndCacheValidationResultSpy = jest.spyOn(service as any, '_getAndCacheValidationResult').mockReturnValue(true);

    const options = { authorizationToken: 'authorizationToken', userId: 'userId' };
    try {
      await service.validate(options);
    } finally {
      expect(_getAndCacheValidationResultSpy).toHaveBeenCalledWith(options.authorizationToken, options.userId);
    }
  });

  it('should create subscriptions list', async () => {
    const expectedPartNumbers = ['GAIV-TO-SUBU', 'MCVW-TO-SUBU'];
    const subsListMock = [
      {
        billingAccountId: 'testId',
        billingAccountName: 'testName',
        contractId: 'testContractId',
        subscriptions: [
          {
            product: { partNumber: expectedPartNumbers[0] },
            region: 'dev'
          },
          {
            product: { partNumber: expectedPartNumbers[1] },
            region: 'dev'
          }
        ]
      }
    ];
    const appConfig: Partial<Config> = {
      regionIdentifier: 'dev'
    };
    (service as any)._appConfig = appConfig;
    ((dataService as unknown) as MockAccountValidatorDataService).requestUserSubscriptions.mockResolvedValue(subsListMock);
    const userprofileMock: Partial<UserProfile> = {
      account: {
        billingAccountId: 'testId',
        name: 'testName'
      }
    }
    const result = await (service as any).createSubscriptionsList(userprofileMock, 'testAuthToken');
    expect(result).toEqual(subsListMock[0].subscriptions);
  });

  it('should get part numbers from a user subscriptions list', async () => {
    const expectedPartNumbers = ['GAIV-TO-SUBU', 'MCVW-TO-SUBU'];
    const subsListMock = [
      {
        subscriptions: [{ product: { partNumber: expectedPartNumbers[0] } }, { product: { partNumber: expectedPartNumbers[1] } }]
      }
    ];

    ((dataService as unknown) as MockAccountValidatorDataService).requestUserSubscriptions.mockResolvedValue(subsListMock);
    const partNumbers = await (service as any)._getUserSubsProductsPartNumbers(null);

    expect(partNumbers).toEqual(expectedPartNumbers);
  });

  describe('validation flow', () => {
    let nodeCache: NodeCache;
    let expectedUserProfile;
    let expectedUserSubscriptions;

    beforeEach(() => {
      nodeCache = new NodeCache();
      const expectedAccountName = 'accountName';
      const expectedPartNumbers = ['GAIV-TO-SUBU', 'MCVW-TO-SUBU'];
      expectedUserSubscriptions = [];

      const appConfig: Partial<Config> = {
        authServiceTokenHost: null,
        ccmServiceHost: 'ccmServiceHost',
        correctAccountNames: [expectedAccountName],
        ccmPartNumbers: expectedPartNumbers
      };
      (service as any)._appConfig = appConfig;
      (service as any)._nodeCache = nodeCache;

      const userProfileMock: Partial<UserProfile> = (expectedUserProfile = {
        account: { name: expectedAccountName, billingAccountId: '123' }
      });
      ((dataService as unknown) as MockAccountValidatorDataService).requestUserProfile.mockResolvedValue(userProfileMock);

      const subsListMock = [
        {
          subscriptions: [{ product: { partNumber: expectedPartNumbers[0] } }, { product: { partNumber: expectedPartNumbers[1] } }]
        }
      ];
      ((dataService as unknown) as MockAccountValidatorDataService).requestUserSubscriptions.mockResolvedValue(subsListMock);
    });

    it('should perform account validation via _getAndCacheValidationResult()', async () => {
      const result = await (service as any)._getAndCacheValidationResult('authToken', 'userid');

      expect(dataService.requestUserProfile).toHaveBeenCalledTimes(1);
      expect(dataService.requestUserSubscriptions).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ pass: true, userProfile: expectedUserProfile, subscriptions: expectedUserSubscriptions });
    });

    it('should perform a 2nd account validation from cache via _getAndCacheValidationResult()', async () => {
      const nodeCacheGetSpy = jest.spyOn(nodeCache, 'get');
      const result1 = await (service as any)._getAndCacheValidationResult('authToken', 'userid');
      expect(nodeCacheGetSpy).toBeCalledTimes(1);
      expect(nodeCacheGetSpy).toHaveReturnedWith(undefined);

      const result2 = await (service as any)._getAndCacheValidationResult('authToken', 'userid');
      expect(nodeCacheGetSpy).toBeCalledTimes(2);
      expect(nodeCacheGetSpy).toHaveReturnedWith(result1);
      expect(result2).toEqual(result1);
    });
  });
});
