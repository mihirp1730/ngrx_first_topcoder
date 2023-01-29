import { Request, Response } from 'express';
import { noop } from 'lodash';
import { of } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { JwtTokenMiddleware } from './jwt-token.middleware';

class MockHttp {
  post = noop;
  get = jest.fn().mockReturnValue(
    of({
      data: {
        jwks_uri: 'http://openId-configuration',
        keys: [
          {
            alg: 'RS256',
            e: 'AQAB',
            kid: 'MTY3MDk4MzIxMQ==',
            kty: 'RSA',
            n: 'n',
            use: 'sig'
          }
        ]
      }
    })
  );
  request = noop;
}

describe('JwtTokenMiddleware', () => {
  let jwtTokenMiddleware: JwtTokenMiddleware;
  const mockHttp = new MockHttp() as any;
  beforeEach(() => {
    jwtTokenMiddleware = new JwtTokenMiddleware(mockHttp);
  });

  it('should be defined', () => {
    expect(new JwtTokenMiddleware(mockHttp)).toBeDefined();
  });

  describe('getToken', () => {
    it('should return bearer token', () => {
      const mockValue = uuid();
      const mockReq = {
        headers: {
          authorization: `Bearer ${mockValue}`
        }
      } as unknown as Request;
      const token = JwtTokenMiddleware.getToken(mockReq);
      expect(token).toBe(mockValue);
    });
    it('should return no bearer token with bad headers', () => {
      const mockReq = {
        headers: {
          authorization: `Bad-Bearer`
        }
      } as unknown as Request;
      const token = JwtTokenMiddleware.getToken(mockReq);
      expect(token).toBe(undefined);
    });
    it('should return a token via cookie', () => {
      const mockValue = uuid();
      const mockReq = {
        cookies: {
          token: mockValue
        }
      } as unknown as Request;
      const token = JwtTokenMiddleware.getToken(mockReq);
      expect(token).toBe(mockValue);
    });

    it('should return a jwt_access via cookie', () => {
      const mockValue = uuid();
      const mockReq = {
        cookies: {
          jwt_access: mockValue
        }
      } as unknown as Request;
      const token = JwtTokenMiddleware.getToken(mockReq);
      expect(token).toBe(mockValue);
    });
  });

  describe('use', () => {
    it('should fail with a 403 with a bad token', (done) => {
      const mockReq = {
        headers: {
          authorization: `Bearer bad-jwt`
        }
      } as unknown as Request;
      const mockRes = {
        send: (body) => {
          expect(body).toEqual({ error: 'No sAuth token' });
          done();
        },
        status: (code) => {
          expect(code).toBe(403);
          return mockRes;
        }
      } as unknown as Response;
      jwtTokenMiddleware.use(mockReq, mockRes, null);
    });
    it('should fail with a 403, wrong public key', (done) => {
      const mockReq = {
        headers: {
          authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ik1UWTNNRGs0TXpJeE1RPT0iLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`
        }
      } as unknown as Request;
      const mockRes = {
        send: (body) => {
          expect(body).toEqual({ error: 'No sAuth token' });
          done();
        },
        status: (code) => {
          expect(code).toBe(403);
          return mockRes;
        }
      } as unknown as Response;
      jwtTokenMiddleware.use(mockReq, mockRes, null);
    });
  });
});
