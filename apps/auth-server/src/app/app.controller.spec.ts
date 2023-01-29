import * as express from 'express';

import { AccountValidatorService, TrafficManagerJwtTokenValidatorService } from './providers';
import { CONFIG_TOKEN, Config } from './modules/config';
import { Logger, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppHealthService } from '@apollo/app/health';
import { ProxyService } from './providers/proxy/proxy.service';
import { sign } from 'jsonwebtoken';

class MockAccountValidatorService {
  validate = jest.fn();
  invalidateOnCache = jest.fn();
}

class MockServerHealthService {
  healthCheck = jest.fn();
}

class MockTMJwtTokenValidatorService {
  validate = jest.fn();
}

class MockLogger {
  error = jest.fn();
  log = jest.fn();
}

const mockGISToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

class MockProxyService {
  authenticate = jest.fn();
  getSauthTokenFromCode = jest.fn();
  refreshToken = jest.fn();
  getUserInfo = jest.fn();
  getLogoutURL = jest.fn();
  getUserToken = jest.fn();
  getGuestToken = jest.fn();
  tokenExchangeService = jest.fn().mockReturnValue([mockGISToken] as any);
}

function getConfigMock(): Config {
  return {
    timeoutInterval: 15,
    enableGuestLogin: true
  } as any;
}

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  let mockServerHealthService: MockServerHealthService;
  let tfJwtValidator: TrafficManagerJwtTokenValidatorService;
  let accountValidator: AccountValidatorService;
  let proxyService: ProxyService;
  let config: Config;

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjExMX0.aPEpaK2J6R2prNMax3yGJFdKRWY7N5cAirFJEVeEKKE';

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AccountValidatorService, useClass: MockAccountValidatorService },
        { provide: TrafficManagerJwtTokenValidatorService, useClass: MockTMJwtTokenValidatorService },
        { provide: Logger, useClass: MockLogger },
        { provide: ProxyService, useClass: MockProxyService },
        { provide: CONFIG_TOKEN, useFactory: getConfigMock },
        {
          provide: AppHealthService,
          useClass: MockServerHealthService
        }
      ]
    }).compile();

    appController = app.get<AppController>(AppController);
    tfJwtValidator = app.get<TrafficManagerJwtTokenValidatorService>(TrafficManagerJwtTokenValidatorService);
    accountValidator = app.get<AccountValidatorService>(AccountValidatorService);
    mockServerHealthService = app.get(AppHealthService);
    proxyService = app.get<ProxyService>(ProxyService);
    config = app.get<Config>(CONFIG_TOKEN);
  });

  describe('trafficValidate', () => {
    it('should call TM JWT validate when token comes from either header or query string', async () => {
      const expectedToken = '123';
      const reqMock = { headers: { 'x-traffic-manager': expectedToken }, query: {} } as unknown as express.Request;
      const resMockStatusSendMock = jest.fn();
      const resMock = {
        status: jest.fn().mockReturnValue({ send: resMockStatusSendMock })
      } as unknown as express.Response;

      // Check when using headers.
      await appController.trafficValidate(reqMock, resMock);

      expect(tfJwtValidator.validate).toHaveBeenCalledTimes(1);
      expect(tfJwtValidator.validate).toHaveBeenCalledWith({ token: expectedToken });

      // Check when using query string.
      const expectedToken2 = '456';
      const reqMock2 = { headers: {}, query: { traffic_manager: expectedToken2 } } as unknown as express.Request;

      (tfJwtValidator as unknown as MockTMJwtTokenValidatorService).validate.mockClear();
      await appController.trafficValidate(reqMock2, resMock);

      expect(tfJwtValidator.validate).toHaveBeenCalledTimes(1);
      expect(tfJwtValidator.validate).toHaveBeenCalledWith({ token: expectedToken2 });
    });

    it('should send response as 200, passing when validation promise was resolved', async () => {
      const expectedToken = '123';
      const reqMock = { headers: { 'x-traffic-manager': expectedToken }, query: {} } as unknown as express.Request;
      const resMockStatusSendMock = jest.fn();
      const resMock = {
        status: jest.fn().mockReturnValue({ send: resMockStatusSendMock })
      } as unknown as express.Response;

      (tfJwtValidator as unknown as MockTMJwtTokenValidatorService).validate.mockResolvedValue(null);
      await appController.trafficValidate(reqMock, resMock);

      expect(tfJwtValidator.validate).toHaveBeenCalledTimes(1);
      expect(tfJwtValidator.validate).toHaveBeenCalledWith({ token: expectedToken });
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMockStatusSendMock).toHaveBeenCalledWith({ pass: true });
    });

    it('should send response as 200, but Not passing when validation promise was rejected', async () => {
      const expectedToken = '123';
      const reqMock = { headers: { 'x-traffic-manager': expectedToken }, query: {} } as unknown as express.Request;
      const resMockStatusSendMock = jest.fn();
      const resMock = {
        status: jest.fn().mockReturnValue({ send: resMockStatusSendMock })
      } as unknown as express.Response;

      (tfJwtValidator as unknown as MockTMJwtTokenValidatorService).validate.mockRejectedValue(null);
      await appController.trafficValidate(reqMock, resMock);

      expect(tfJwtValidator.validate).toHaveBeenCalledTimes(1);
      expect(tfJwtValidator.validate).toHaveBeenCalledWith({ token: expectedToken });
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMockStatusSendMock).toHaveBeenCalledWith({ pass: false });
    });

    it('should send response as 400 when no token was found on request', async () => {
      const reqMock = { headers: {}, query: {} } as express.Request;
      const resMockStatusSendMock = jest.fn();
      const resMock = {
        status: jest.fn().mockReturnValue({ send: resMockStatusSendMock })
      } as unknown as express.Response;

      await expect(appController.trafficValidate(reqMock, resMock)).rejects.toThrow('empty traffic manager token !');
    });
  });

  describe('callback', () => {
    it('should redirect and set jwt token in cookie', async () => {
      const spy = jest.spyOn(proxyService, 'getSauthTokenFromCode').mockReturnValue(['test', mockToken, 'refresh token'] as any);
      const code = 'testcode';
      const state = 'teststate;test';
      const resMock = {
        cookie: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      await appController.handleCallback(code, state, resMock, { hostname: 'localhost' } as any);
      expect(spy).toHaveBeenCalled();
      expect(resMock.cookie).toHaveBeenCalled();
      expect(resMock.redirect).toHaveBeenCalledWith('test');
    });

    it('should return error when getting error from sauth', async () => {
      const spy = jest.spyOn(proxyService, 'getSauthTokenFromCode').mockReturnValue([null, null, null] as any);
      const code = 'testcode';
      const state = 'teststate;test';
      const resMockStatusSendMock = jest.fn();
      const resMock = {
        status: jest.fn().mockReturnValue({ send: resMockStatusSendMock })
      } as unknown as express.Response;
      await appController.handleCallback(code, state, resMock, { hostname: 'localhost' } as any);
      expect(spy).toHaveBeenCalled();
      expect(resMock.status).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('should redirect to login page', () => {
      const spy = jest.spyOn(proxyService, 'authenticate').mockReturnValue(['test', '']);
      const state = 'test;test';
      const req = { protocol: 'https', host: 'localhost:4200' };
      const resMock = {
        header: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      appController.handleLogin(req as any, state, resMock);
      expect(spy).toHaveBeenCalled();
      expect(resMock.redirect).toHaveBeenCalledWith('test');
    });
  });

  describe('token', () => {
    it('should return token in body', async () => {
      const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;
      const accessToken = {
        exp: oneHourFromNow
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken,
          jwt_refresh: 'test refresh',
          jwt_id: 'test id token',
          gis_token: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getUserInfo').mockReturnValue(['email', 'hd', 'firstname', 'lastname'] as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalledWith(signedAccessToken);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({
        access_token: signedAccessToken,
        id_token: 'test id token',
        name: 'firstname lastname',
        email: 'email',
        hd: 'hd',
        gis_token: mockGISToken
      });
    });

    it('should refresh token when request token is about to expire', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = {
        exp: now
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken,
          jwt_refresh: 'test refresh',
          gis_token: signedAccessToken,
          jwt_id: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy1 = jest.spyOn(proxyService, 'refreshToken').mockReturnValue([signedAccessToken, 'newRefreshToken', 'newIdToken'] as any);
      const spy2 = jest.spyOn(proxyService, 'getUserInfo').mockReturnValue(['email', 'hd', 'firstname', 'lastname'] as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy1).toHaveBeenCalledWith('test refresh');
      expect(spy2).toHaveBeenCalledWith(signedAccessToken);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({
        access_token: signedAccessToken,
        id_token: signedAccessToken,
        name: 'firstname lastname',
        email: 'email',
        hd: 'hd',
        gis_token: mockGISToken
      });
    });

    it('should return token in body and get firstname from lastname', async () => {
      const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;
      const accessToken = {
        exp: oneHourFromNow
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken,
          jwt_refresh: 'test refresh',
          jwt_id: 'test id token',
          gis_token: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getUserInfo').mockReturnValue(['email', 'hd', '', 'firstname-lastname'] as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalledWith(signedAccessToken);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({
        access_token: signedAccessToken,
        id_token: 'test id token',
        name: 'firstname lastname',
        email: 'email',
        hd: 'hd',
        gis_token: mockGISToken
      });
    });

    it('should return error if userinfo is not having values', async () => {
      const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;
      const accessToken = {
        exp: oneHourFromNow
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken,
          jwt_refresh: 'test refresh',
          jwt_id: 'test id token',
          gis_token: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getUserInfo').mockReturnValue(['', '', '', ''] as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalledWith(signedAccessToken);
      // expect(tokenEXchangeSpy).toHaveBeenCalled();
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.send).toHaveBeenCalledWith('Error when getting user information!');
    });

    it('should get guest token if req has no token in cookie', async () => {
      const reqMock = { cookies: {} } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getGuestToken').mockReturnValue(mockToken as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalled();
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({ access_token: mockToken });
    });

    it('should refresh guest token if request token is about to expire', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = {
        exp: now
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getGuestToken').mockReturnValue(signedAccessToken as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalled();
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({ access_token: signedAccessToken });
    });

    it('should return token if current one is valid', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = {
        exp: now + 60 * 60 * 1000
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      await appController.getSauthToken(reqMock, resMock);
      expect(resMock.status).toHaveBeenCalledWith(200);
      expect(resMock.json).toHaveBeenCalledWith({ access_token: signedAccessToken, gisToken: mockGISToken });
    });

    it('should return error if having error when getting token', async () => {
      const now = Math.floor(Date.now() / 1000);
      const accessToken = {
        exp: now
      };
      const signedAccessToken = sign(accessToken, 'mySecret');
      const reqMock = {
        cookies: {
          jwt_access: signedAccessToken
        }
      } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getGuestToken').mockReturnValue(null as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalled();
      expect(resMock.status).toHaveBeenCalledWith(500);
      expect(resMock.json).toHaveBeenCalledWith({ access_token: null, gisToken: mockGISToken });
    });

    it('should call getUserToken if guest login is disabled', async () => {
      config.enableGuestLogin = false;
      const reqMock = { cookies: {} } as unknown as express.Request;
      const resMock = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn(),
        cookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(appController, 'getUserToken').mockReturnValue(null as any);
      await appController.getSauthToken(reqMock, resMock);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('token-clear', () => {
    it('should clear cookies in response', () => {
      const resMock = {
        cookie: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(resMock, 'clearCookie');
      appController.clearTokens(resMock);
      expect(spy).toHaveBeenCalledTimes(3);
      expect(resMock.json).toHaveBeenCalledWith({ error: null });
    });
  });

  describe('logout', () => {
    it('should redirect to log out URL and clear cookies', () => {
      const id_token = 'test_token';
      let redirect_url = '/test';
      const resMock = {
        cookie: jest.fn().mockReturnThis(),
        redirect: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis()
      } as unknown as express.Response;
      const spy = jest.spyOn(proxyService, 'getLogoutURL').mockReturnValue('test_logout_url');
      appController.handleLogout(id_token, redirect_url, resMock);
      expect(spy).toHaveBeenCalledWith(id_token, redirect_url);
      expect(resMock.redirect).toHaveBeenCalledWith('test_logout_url');
      expect(resMock.clearCookie).toBeCalledTimes(3);

      redirect_url = undefined;
      appController.handleLogout(id_token, redirect_url, resMock);
      expect(resMock.redirect).toHaveBeenCalledWith('test_logout_url');
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      mockServerHealthService.healthCheck.mockReturnValue({ statusCode: 200, message: 'OK', error: 'No Error' });
      const res = appController.getHealthCheck('test');

      expect(res).toEqual({ statusCode: 200, message: 'OK', error: 'No Error' });
    });

    it('should raise NotFoundException for health check', async () => {
      mockServerHealthService.healthCheck.mockImplementation(() => {
        throw new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        });
      });

      expect(() => appController.getHealthCheck(null)).toThrow(
        new NotFoundException({
          statusCode: 404,
          message: 'App Key not found in headers to make call to this /health endpoint',
          error: 'Not Found'
        })
      );
    });
  });
});
