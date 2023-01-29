import { GetPublicKeyOrSecret, JwtHeader } from 'jsonwebtoken';
import { JwksClient, SigningKey } from 'jwks-rsa';
import { v4 as uuid } from 'uuid';

import { GetKeyFactory } from './get-key.factory';

describe('GetKeyFactory', () => {
  let mockJwksClient: JwksClient;
  let mockJwksClientResponseError: Error|null;
  let mockJwksClientResponseKeys: SigningKey;
  let getPublicKeyOrSecret: GetPublicKeyOrSecret;
  beforeEach(() => {
    mockJwksClientResponseError = null;
    mockJwksClientResponseKeys = undefined;
    mockJwksClient = {
      getSigningKey: (kid, cb) => cb(
        mockJwksClientResponseError,
        mockJwksClientResponseKeys
      )
    } as unknown as JwksClient;
    getPublicKeyOrSecret = GetKeyFactory(mockJwksClient)();
  });

  it('should be created', () => {
    expect(getPublicKeyOrSecret).toBeTruthy();
  });

  it('should handle no header', (done) => {
    const mockHeaders = null as unknown as JwtHeader;
    getPublicKeyOrSecret(mockHeaders, (err) => {
      expect(err).toBeTruthy();
      done();
    });
  });

  it('should handle no header kid', (done) => {
    const mockHeaders = { kid: null } as unknown as JwtHeader;
    getPublicKeyOrSecret(mockHeaders, (err) => {
      expect(err).toBeTruthy();
      done();
    });
  });

  it('should handle signing key errors', (done) => {
    const mockHeaders = { kid: uuid() } as unknown as JwtHeader;
    mockJwksClientResponseError = uuid() as unknown as Error;
    getPublicKeyOrSecret(mockHeaders, (err) => {
      expect(err).toBe(mockJwksClientResponseError);
      done();
    });
  });

  it('should handle no signing keys', (done) => {
    const mockHeaders = { kid: uuid() } as unknown as JwtHeader;
    getPublicKeyOrSecret(mockHeaders, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toBe('No public keys were received.');
      done();
    });
  });

  it('should handle no public keys', (done) => {
    const mockHeaders = { kid: uuid() } as unknown as JwtHeader;
    mockJwksClientResponseKeys = {
      getPublicKey: () => undefined
    } as unknown as SigningKey;
    getPublicKeyOrSecret(mockHeaders, (err) => {
      expect(err).toBeTruthy();
      expect(err.message).toBe('No matching public key was found.');
      done();
    });
  });

  it('should handle public key', (done) => {
    const mockHeaders = { kid: uuid() } as unknown as JwtHeader;
    const mockPublicKey = uuid();
    mockJwksClientResponseKeys = {
      getPublicKey: () => mockPublicKey
    } as unknown as SigningKey;
    getPublicKeyOrSecret(mockHeaders, (err, publicKey) => {
      expect(err).toBeFalsy();
      expect(publicKey).toBe(mockPublicKey)
      done();
    });
  });

});
