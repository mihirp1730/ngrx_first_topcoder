import { RequestHandler } from 'express';
import { GetPublicKeyOrSecret, verify, VerifyOptions } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

import { JwtTokenValidationFactory } from './jwt-token-validation.factory';

describe('JwtTokenValidationFactory', () => {
  let mockVerifyFactory: () => typeof verify;
  let mockVerifyResponseErr: any;
  let mockVerifyResponseObject: any|undefined;
  let mockGetKeyFactory: () => GetPublicKeyOrSecret;
  let mockVerifyOptions: Partial<VerifyOptions>;
  let requestHandler: RequestHandler;

  beforeEach(() => {
    mockVerifyFactory = () => function(token, getKey, verifyOptions, callback) {
      callback(mockVerifyResponseErr, mockVerifyResponseObject);
    } as unknown as typeof verify;
    mockVerifyResponseErr = null;
    mockVerifyResponseObject = {};
    mockGetKeyFactory = () => null;
    mockVerifyOptions = {};
    requestHandler = JwtTokenValidationFactory(
      mockVerifyFactory,
      mockGetKeyFactory,
      mockVerifyOptions
    );
  });

  it('should be created', () => {
    expect(requestHandler).toBeTruthy();
  });

  it('should handle OPTIONS call', (done) => {
    const mockRequestHandlerRequest = {
      method: 'OPTIONS'
    } as any;
    const mockRequestHandlerResponse = { } as any;
    requestHandler(
      mockRequestHandlerRequest,
      mockRequestHandlerResponse,
      () => {
        done();
      }
    );
  });

  it('should handle verification errors', (done) => {
    const mockError = uuid();
    const mockRequestHandlerRequest = {
      headers: {
        authorization: uuid()
      }
    } as any;
    const mockRequestHandlerResponse = {
      status: (code) => {
        expect(code).toBe(400);
        return {
          send: ({ error }) => {
            expect(error.endsWith(mockError)).toBeTruthy();
            done();
          }
        }
      }
    } as any;
    mockVerifyResponseErr = new Error(mockError);
    requestHandler(
      mockRequestHandlerRequest,
      mockRequestHandlerResponse,
      null
    );
  });

  it('should handle no data', (done) => {
    const mockRequestHandlerRequest = {
      headers: {
        authorization: uuid()
      }
    } as any;
    const mockRequestHandlerResponse = {
      status: (code) => {
        expect(code).toBe(400);
        return {
          send: ({ error }) => {
            expect(error.endsWith('no data was received')).toBeTruthy();
            done();
          }
        }
      }
    } as any;
    mockVerifyResponseObject = null;
    requestHandler(
      mockRequestHandlerRequest,
      mockRequestHandlerResponse,
      null
    );
  });

  it('should handle data', (done) => {
    const mockRequestHandlerRequest = {
      headers: {
        authorization: uuid()
      }
    } as any;
    const mockRequestHandlerResponse = { } as any;
    mockVerifyResponseObject = uuid();
    requestHandler(
      mockRequestHandlerRequest,
      mockRequestHandlerResponse,
      () => {
        expect(mockRequestHandlerRequest.session).toBe(mockVerifyResponseObject);
        done();
      }
    );
  });

});
