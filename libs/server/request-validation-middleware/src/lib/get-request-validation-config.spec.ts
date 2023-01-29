import { v4 as uuid } from 'uuid';

import { GetRequestValidationsConfig } from './get-request-validation-config';

describe('GetRequestValidationsConfig', () => {
  it('should return an empty array without an environment', () => {
    const result = GetRequestValidationsConfig({});
    expect(result).toEqual([]);
  });
  xit('should return an traffic manager validation model', () => {
    const TRAFFIC_MANAGER_VALIDATION_ENDPOINT = uuid();
    const TRAFFIC_MANAGER_VALIDATION_CACHE_KEY = uuid();
    const result = GetRequestValidationsConfig({
      VALIDATION_CACHE_TIMEOUT_SEC: '111',
      VALIDATION_NUMBERS_OF_RETRIES: '222',
      VALIDATION_RETRY_INTERVAL: '333',
      TRAFFIC_MANAGER_IS_ENABLED: 'true',
      TRAFFIC_MANAGER_VALIDATION_ENDPOINT,
      TRAFFIC_MANAGER_VALIDATION_CACHE_KEY
    });
    expect(result).toEqual([
      {
        cacheTimeout: 111,
        numberOfRetries: 222,
        retryInterval: 333,
        url: TRAFFIC_MANAGER_VALIDATION_ENDPOINT,
        validationKey: TRAFFIC_MANAGER_VALIDATION_CACHE_KEY
      }
    ]);
  });
});
