import { Test } from '@nestjs/testing';
import * as NodeCache from 'node-cache';
import * as nock from 'nock';
import * as jwt from 'jsonwebtoken';

import { CONFIG_TOKEN, Config } from '../../modules/config';
import { nodeCacheProvider } from '../node-cache.provider';

import { TrafficManagerJwtTokenValidatorService, JWT_VERIFY_OPTIONS_TOKEN } from './traffic-manager-jwt-token-validator.service';
import { Logger } from '@nestjs/common';

// tslint:disable:max-line-length
const MOCK_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1UVTBNemd3T1RBMU9RPT0ifQ.eyJwZXJtaXRVcmwiOiJodHRwczovL3dnLWRlbW8uZGUuZXZkLmNsb3VkLnNsYi1kcy5jb20vYXRsYXMvIiwiY291bnRyeUNvZGUiOiJQTCIsImlzcyI6ImNmcy10cmFmZmljLW1hbmFnZXIiLCJpYXQiOjE1NDM4MzM2OTUsImV4cCI6MTU0Mzg0ODA5NSwiYXVkIjoiaHR0cHM6Ly93Zy1kZW1vLmRlLmV2ZC5jbG91ZC5zbGItZHMuY29tL2F0bGFzLyJ9.tuoh7qoztHIqgBW924CzMcYgSF0b19G-ngbaqc4RZPm-R4wP5WxYLOwfwcsmN9G0jnY3HnCizc4GuhEHMIbcii9ARhNvEaaZaieVjDCPaFDQ_osx-pw7RdCUQGGMlte_VNWn63XWOgJyQTttjV0ieGlGN24fTPXwtMPrWQla0ImvONC6puR0BL3-Y14JsX7lnu7wc_q8IgpcWR6Z9v0JfFzOQ596dUuv4HtVdkqQypUi-00VbKRAhN1TOqThfMzyJasqosFLiq_SS9dUTCN5aEsyPo_cXGFcrPX7Y5YZgglpjTpBsyHBO8tbFMZQUq34s2857K4yRyt6rV3WsJr_Vg';

const MOCK_JWKS_URL = 'http://jwrks';

/** Used in JWKS requests. */
const MOCK_JWKS_RESPONSE = {
  keys: [
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: 'MTU0MzgwOTA1OQ==',
      kty: 'RSA',
      // tslint:disable-next-line:max-line-length
      n:
        'tye44jk7FCsbVqUR82Mz7exp5EmMnpRlsP7ZicEnBqMF_NAEL7VVNyBEIi1PLS8Hs2tnWKLE3YXUu_tTMOx1kq-xVp4Fyk8a7hHLSNe31fuSDqMsVfY3e7SECoPbYfd_ThuDgCwsvcoT8wce4LbD6M9upNWYbhdYaW0TZcXr56bI5ThaytLv_Ry0AeuGa3CAxBslSSqBsh51bu3RptLif9L2knN-cxlsxjkcIDgI5v4x12_T7phLcyULpLdlkN0xq-XjvH0zF5q7KEATvAXyqpnamrE27ptxwP2D0Y5g_YUyH4_-SDygzYEbvDJqS5yafrG7DbhhUn5W0iGKo-kiTw',
      use: 'sig'
    }
  ]
};

function getConfigMock(): Config {
  return {
    trafficManagerJwksUri: MOCK_JWKS_URL,
    trafficManagerIssuer: 'cfs-traffic-manager'
  } as any;
}

class MockLogger {
  log = jest.fn();
  error = jest.fn();
}

describe('TrafficManagerJwtTokenValidatorService', () => {
  let service: TrafficManagerJwtTokenValidatorService;
  let nodeCache: NodeCache;

  beforeEach(async () => {
    // Setup nock. Needed for isolation `jwksRsaClient` HTTP requests.
    nock(MOCK_JWKS_URL)
      .get('/')
      .reply(200, MOCK_JWKS_RESPONSE);

    const app = await Test.createTestingModule({
      providers: [
        TrafficManagerJwtTokenValidatorService,
        { provide: CONFIG_TOKEN, useFactory: getConfigMock },
        { provide: Logger, useClass: MockLogger },
        nodeCacheProvider,
        // Override JWT issuer.
        { provide: JWT_VERIFY_OPTIONS_TOKEN, useValue: { issuer: 'issuer' } as jwt.VerifyOptions }
      ]
    }).compile();

    service = app.get<TrafficManagerJwtTokenValidatorService>(TrafficManagerJwtTokenValidatorService);
    nodeCache = app.get<NodeCache>(NodeCache);
  });

  it('should validate token by using cache', async () => {
    const mockTmTokenValidHashedCacheKey = 'traffic-manager-key=-299414004';
    nodeCache.set(mockTmTokenValidHashedCacheKey, true);

    // Checks that validation passed (i.e. promise not have thrown).
    expect(async () => await service.validate({ token: MOCK_TOKEN })).not.toThrow();
  });

  it('should throw an error when validating token by using cache', (done) => {
    const mockTmTokenValidHashedCacheKey = 'traffic-manager-key=-299414004';
    nodeCache.set(mockTmTokenValidHashedCacheKey, true);

    service.validate({ token: '' }).catch((e) => {
      expect(e.message).toEqual('wrong value');
      done();
    })
  });

  it('should get correct cache key', async () => {
    // tslint:disable-next-line:max-line-length
    const mockBadToken =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik1UVTBNems0TVRnM01RPT0ifQ.eyJwZXJtaXRVcmwiOiJodHRwczovL3dnLWRlbW8uZGUuZXZkLmNsb3VkLnNsYi1kcy5jb20vYXRsYXMvIiwiY291bnRyeUNvZGUiOiJQTCIsImlzcyI6ImNmcy10cmFmZmljLW1hbmFnZXIiLCJpYXQiOjE1NDQwMTA3MzQsImV4cCI6MTU0NDAyNTEzNCwiYXVkIjoiaHR0cHM6Ly93Zy1kZW1vLmRlLmV2ZC5jbG91ZC5zbGItZHMuY29tL2F0bGFzLyJ9.qHhSiLbCTI7seQl3DDGiPZohHgOu014lBJht0STQ4J8-N-2lsyJvv_KSMX_iFk3ENVKYsTv0a_om6QPFTpPT2JPDdsbrLSHoC9fJB7RF3NTBCsN_-62t4ARwZc89sl0niUtimFrx48Sm6G-_cfzye98Qiv0P-vNeYg256PH5REJWgJLtmQQhO7GuSITz1mGcVRlBNof9FqBYzOe--NPgEtTfet7KPbQrG32_NqKYOPfSz41FfQSRTCg-GRIpItx6PNNP7GmbEordcseffvkPlRwaCTbK9fO5EfQKajcDKt4XH8Nrt2N81-LYsJmx0lnnc5i2ixNwlrKHXpCTAixbtg';

    let errorMsg: string;
    try {
      await service.validate({ token: mockBadToken });
    } catch (error) {
      errorMsg = error.message;
    }
    // Error from `jsonwebtoken` and `jkws-rsa` libraries.
    expect(errorMsg).toBe(`error in secret or public key callback: Unable to find a signing key that matches 'MTU0Mzk4MTg3MQ=='`);
  });

  it('should validate call jwrks only once', async () => {
    let errorMsg: string;
    try {
      await service.validate({ token: MOCK_TOKEN });
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBe('jwt expired');
  });

  it('should validate call jwrks and signing key for the second call ', async () => {
    let errorMsg: string;
    try {
      await service.validate({ token: MOCK_TOKEN });
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBe('jwt expired');
    errorMsg = null;

    try {
      await service.validate({ token: MOCK_TOKEN });
    } catch (error) {
      errorMsg = error.message;
    }
    expect(errorMsg).toBe('jwt expired');
  });

  describe(`validations ignoring JWT expiration`, () => {
    let service2: TrafficManagerJwtTokenValidatorService;
    let nodeCache2: NodeCache;

    beforeEach(async () => {
      const app = await Test.createTestingModule({
        providers: [
          TrafficManagerJwtTokenValidatorService,
          { provide: CONFIG_TOKEN, useFactory: getConfigMock },
          { provide: Logger, useClass: MockLogger },
          nodeCacheProvider,
          // Override JWT ignoreExpiration.
          {
            provide: JWT_VERIFY_OPTIONS_TOKEN,
            useValue: { issuer: 'cfs-traffic-manager', ignoreExpiration: true } as jwt.VerifyOptions
          }
        ]
      }).compile();

      service2 = app.get<TrafficManagerJwtTokenValidatorService>(TrafficManagerJwtTokenValidatorService);
      nodeCache2 = app.get<NodeCache>(NodeCache);
    });

    it('should validate', async () => {
      // Checks that validation passed (i.e. promise not have thrown).
      expect(async () => await service2.validate({ token: MOCK_TOKEN })).not.toThrow();
    });

    it('should store in cache', async () => {
      // Mock the Date construction object to simulate the expiration date calculated of the MOCK_TOKEN
      //  from `traffic-manager-cache.class.ts#saveValidJwtCacheKey`.
      // Also because Date.now() is needed, we mock the whole Date class instead.
      // Based from https://codewithhugo.com/mocking-the-current-date-in-jest-tests#mock-the-whole-date-class-with-a-fixed-date-instance
      const mockTokenExpCalcDate = new Date('Mon Dec 03 2018 13:14:49 GMT+0100');
      const realDate = Date;
      global.Date = class extends Date {
        constructor(date) {
          if (date) {
            return super(date) as any;
          }

          return mockTokenExpCalcDate;
        }
      } as any;

      const cacheSetSpy = jest.spyOn(nodeCache2, 'set');

      let validationFailedError;
      try {
        await service2.validate({ token: MOCK_TOKEN });
      } catch (error) {
        validationFailedError = error;
      }

      // Date mock cleanup.
      global.Date = realDate;

      // Checks that validation passed (i.e. promise returned).
      expect(validationFailedError).toBeUndefined();

      // Cache `set` should have been called 2 times. Check the last `set` where the valid JWT cache key is set.
      expect(cacheSetSpy).toBeCalledTimes(2);
      expect(cacheSetSpy).toHaveBeenNthCalledWith(2, 'traffic-manager-key=-299414004', true, 8506000);
    });
  });
});
