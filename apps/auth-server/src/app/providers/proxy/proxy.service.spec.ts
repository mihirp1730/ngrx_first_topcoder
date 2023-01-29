import { of, throwError } from 'rxjs';

import { Logger } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Test } from '@nestjs/testing';
import { noop } from 'lodash';

class MockHttp {
  post = noop;
  get = noop;
  request = noop;
}

describe('ProxyService', () => {
  let service: ProxyService;
  let mockConfig: any;
  let mockHttp: any;
  let mockLogger: Logger;
  let mockFeatureFlagService: any;
  const accessTokenMock =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  beforeEach(async () => {
    mockConfig = {
      clientSecret: '',
      tokenServiceUrl: 'test',
      postLogoutRedirectUri: 'test',
      redirectUri: 'test',
      sauthUrl: 'testurl',
      clientId: 'testid',
      guestClientId: 'guestClientId',
      guestClientSecret: 'guestClientSecret'
    };
    mockHttp = new MockHttp() as any;
    mockLogger = {
      log: () => null,
      error: () => null
    } as unknown as Logger;
    mockFeatureFlagService = {
      getFeatureFlag: () => true
    } as unknown as Logger;
    const app = await Test.createTestingModule({
      providers: [
        {
          provide: ProxyService,
          useFactory: () => {
            return new ProxyService(mockHttp, mockLogger, mockConfig, mockFeatureFlagService);
          }
        }
      ]
    }).compile();
    service = app.get<ProxyService>(ProxyService);
  });

  describe('authenticate', () => {
    it('should return url', () => {
      const state = 'test;test';
      const [redirect, nonce] = service.authenticate(state, 'https://hostname');
      expect(redirect).toContain(nonce);
      expect(redirect).toContain(mockConfig.sauthUrl);
      expect(redirect).toContain(encodeURIComponent(state));
    });
    it('should return url, host is localhost', () => {
      const state = 'test;test';
      const [redirect, nonce] = service.authenticate(state, 'https://localhost');
      expect(redirect).toContain(nonce);
      expect(redirect).toContain(mockConfig.sauthUrl);
      expect(redirect).toContain(encodeURIComponent(state));
    });
  });

  describe('getSauthTokenFromCode', () => {
    it('should make post call to get token', async () => {
      const mockResponse = {
        data: {
          id_token: 'id token',
          access_token: 'access token',
          refresh_token: 'refresh token'
        }
      };
      const spy = jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockResponse));
      const [id_token, access_token, refresh_token] = await service.getSauthTokenFromCode('test', 'localhost');
      expect(spy).toHaveBeenCalled();
      expect(id_token).toBe('id token');
      expect(access_token).toBe('access token');
      expect(refresh_token).toBe('refresh token');
    });

    it('should make post call to get token, host is not localhost', async () => {
      const mockResponse = {
        data: {
          id_token: 'id token',
          access_token: 'access token',
          refresh_token: 'refresh token'
        }
      };
      const spy = jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockResponse));
      const [id_token, access_token, refresh_token] = await service.getSauthTokenFromCode('test', 'evd');
      expect(spy).toHaveBeenCalled();
      expect(id_token).toBe('id token');
      expect(access_token).toBe('access token');
      expect(refresh_token).toBe('refresh token');
    });

    xit('should handle the error in the post request', (done) => {
      jest.spyOn(mockHttp, 'get').mockImplementation(() => throwError(new Error('error')));

      service.getSauthTokenFromCode(accessTokenMock, 'localhost').then((result) => {
        expect(result).not.toEqual('');
        done();
      });
    });
  });

  describe('refreshToken', () => {
    it('should make post call to refresh token', async () => {
      const refreshTokenMock = 'refresh token';
      const mockResponse = {
        data: {
          access_token: 'access token',
          refresh_token: 'refresh token',
          id_token: 'id token'
        }
      };
      const spy = jest.spyOn(mockHttp, 'post').mockReturnValue(of(mockResponse));
      const [access_token, refresh_token, id_token] = await service.refreshToken(refreshTokenMock);
      expect(spy).toHaveBeenCalled();
      expect(access_token).toBe('access token');
      expect(refresh_token).toBe('refresh token');
      expect(id_token).toBe('id token');
    });

    it('should handle the error in the post request', (done) => {
      jest.spyOn(mockHttp, 'post').mockImplementation(() => throwError(new Error('error')));

      service.refreshToken('test').then((result) => {
        expect(result).not.toEqual('');
        done();
      });
    });
  });

  describe('tokenExchangeService', () => {
    it('should make post call to tokenExchangeService to get GIS Token', async () => {
      const gisToken = {
        data: {
          access_token: 'GIS token'
        }
      };
      const accessToken = 'access token';
      const spy = jest.spyOn(mockHttp, 'post').mockReturnValue(of(gisToken));
      const [access_token] = await service.tokenExchangeService(accessToken);
      expect(spy).toHaveBeenCalled();
      expect(access_token).toBe('GIS token');
    });

    it('should handle the error in the post request', (done) => {
      jest.spyOn(mockHttp, 'post').mockImplementation(() => throwError(new Error('error')));

      service.refreshToken('test').then((result) => {
        expect(result).not.toEqual('');
        done();
      });
    });
  });

  describe('getUserInfo', () => {
    it('should make get call to get user information', async () => {
      const mockResponse = {
        data: {
          email: 'email',
          hd: 'hd',
          given_name: 'firstname',
          family_name: 'lastname'
        }
      };
      const spy = jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockResponse));
      const [email, hd, firstname, lastname] = await service.getUserInfo(accessTokenMock);
      expect(spy).toHaveBeenCalled();
      expect(email).toBe('email');
      expect(hd).toBe('hd');
      expect(firstname).toBe('firstname');
      expect(lastname).toBe('lastname');
    });

    it('should make get call to get user information, sauthClaim feature flag disabled', async () => {
      const mockResponse = {
        data: {
          email: 'email',
          hd: 'hd',
          given_name: 'given_name',
          family_name: 'family_name',
          firstname: 'firstname',
          lastname: 'lastname'
        }
      };
      const spy = jest.spyOn(mockHttp, 'get').mockReturnValue(of(mockResponse));
      jest.spyOn(mockFeatureFlagService, 'getFeatureFlag').mockReturnValue(false);

      const [email, hd, firstname, lastname] = await service.getUserInfo(accessTokenMock);
      expect(spy).toHaveBeenCalled();
      expect(email).toBe('email');
      expect(hd).toBe('hd');
      expect(firstname).toBe('firstname');
      expect(lastname).toBe('lastname');
    });

    it('should handle the error in the post request', (done) => {
      jest.spyOn(mockHttp, 'get').mockImplementation(() => throwError(new Error('error')));

      service.getUserInfo(accessTokenMock).then((result) => {
        expect(result).not.toEqual('');
        done();
      });
    });
  });

  describe('getGuestToken', () => {
    it('should make post call to get guest access token', async () => {
      const mockResponse = {
        data: {
          access_token: 'accessToken'
        }
      };
      const spy = jest.spyOn(mockHttp, 'request').mockReturnValue(of(mockResponse));
      const accessToken = await service.getGuestToken();
      expect(spy).toHaveBeenCalled();
      expect(accessToken).toBe('accessToken');
    });

    it('should return null when post call error', (done) => {
      jest.spyOn(mockHttp, 'request').mockImplementation(() => throwError(new Error('error')));

      service.getGuestToken().then((result) => {
        expect(result).toBe(null);
        done();
      });
    });
  });

  describe('getLogoutURL', () => {
    it('should get logout url', () => {
      let result = service.getLogoutURL('test token');
      expect(result).toBe('testurl/slo?id_token_hint=test%20token&post_logout_redirect_uri=test');

      result = service.getLogoutURL('test token', '/test');
      expect(result).toBe('testurl/slo?id_token_hint=test%20token&post_logout_redirect_uri=%2Ftest');
    });
  });
});
