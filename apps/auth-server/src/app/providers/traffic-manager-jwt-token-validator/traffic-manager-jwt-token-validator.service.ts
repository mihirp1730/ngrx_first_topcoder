import { GaiaTraceClass } from '@apollo/tracer';
import { Inject, Injectable, Optional, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as jwksRsaClient from 'jwks-rsa';
import * as NodeCache from 'node-cache';

import { Config, CONFIG_TOKEN } from '../../modules/config';
import { ValidatorAbstract } from '../classes/validator.abstract';
import { TMCache } from './traffic-manager-cache.class';

/** Token for providing `jwt.VerifyOptions` on constructor. */
export const JWT_VERIFY_OPTIONS_TOKEN = Symbol('traffic manager jwt.VerifyOptions provider token');

interface TrafficManagerValidationOptions {
  token: string;
}

/**
 * Handles validation (by checking cache of previously verified JWts)
 * and verification (by asking JWT verifiers) of JWT tokens
 * used for Traffic Manager.
 *
 * Based from call-validation-service.
 */
@Injectable()
@GaiaTraceClass
export class TrafficManagerJwtTokenValidatorService extends ValidatorAbstract<TrafficManagerValidationOptions> {
  private _cache: TMCache;
  /** JWKS client used to get/issue "signed keys" used on JWT verification. */
  private _jwksClient: jwksRsaClient.JwksClient;
  /** Options given to JWT verifier on each `validate()` call. */
  private _jwtVerifyOptions: jwt.VerifyOptions;

  /**
   * @param jwtVerifyOptions Optional additional JWT library `VerifyOptions` that patches the preset ones.
   */
  constructor(
    @Inject(CONFIG_TOKEN) _appConfig: Config,
    logger: Logger,
    nodeCache: NodeCache,
    @Inject(JWT_VERIFY_OPTIONS_TOKEN) @Optional() jwtVerifyOptions: jwt.VerifyOptions
  ) {
    super(logger, nodeCache);

    this._cache = new TMCache(logger, nodeCache);
    this._jwksClient = jwksRsaClient({ jwksUri: _appConfig.trafficManagerJwksUri });
    this._jwtVerifyOptions = {
      algorithms: ['RS256'],
      issuer: _appConfig.trafficManagerIssuer,
      ...jwtVerifyOptions
    };
  }

  /**
   * Validates/verifies a Traffic Manager JWT token.
   *
   * @returns Promise that resolves if JWT is valid, or rejects if invalid.
   */
  async validate(options: TrafficManagerValidationOptions): Promise<void> {
    const { token } = options;
    this._logger.log({ message: 'traffic token validation start ' });

    const cacheKey = this._getCacheKey(token);
    this._logger.log({ message: 'traffic token validation cache check ', cacheKey });

    // Check JWT is still valid on cache.
    if (this._cache.isJwtCacheKeyValid(cacheKey)) {
      this._logger.log({ message: 'traffic token validation from cache ', cacheKey });
      return;
    }

    // Validate/verify JWT manually.
    return new Promise((resolve, reject) => {
      const promiseResolveRejection = { resolve, reject };
      jwt.verify(
        token,
        (header, callback) => this._getJwksSignKey(header, callback),
        this._jwtVerifyOptions,
        (error, decodedJwt) => this._handleJwtVerification(error, decodedJwt, cacheKey, promiseResolveRejection)
      );
    });
  }

  /** Gets the key used for cache operations based on JWT token. */
  protected _getCacheKey(jwtToken: string): string {
    return TMCache.getJwtCacheKey(jwtToken);
  }

  /**
   * Handler called as callback after a JWT is verified by JWT library.
   *
   * Currently logs, and saves verification into cache with an expiration given by the JWT.
   */
  private _handleJwtVerification(
    error: jwt.VerifyErrors | null,
    decodedJwt: any | undefined,
    cacheKey: string,
    { resolve, reject }: { resolve: () => void; reject: (reason: any) => void }
  ): void {
    if (error) {
      this._logger.error({ message: 'jwt decoded and verified error !', error });
      return reject(error);
    }

    this._logger.log({ message: 'jwt decoded and verified !', decodedJwt });
    this._cache.saveValidJwtCacheKey(cacheKey, decodedJwt.exp);
    resolve();
  }

  /**
   * Gets a JWKS "signed key",
   * either from cache if exists and still valid,
   * or manually by calling external issuer via JWKS client (and then caching it),
   * and serves it into the callback.
   *
   * @param jwtHeader JWT headers used to get a JWKS "signed key".
   * @param callback JWT library verification callback where to give the key.
   */
  private _getJwksSignKey(jwtHeader: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
    this._logger.log({ message: 'traffic token validation get signing key  ' });

    // Cache check. Get the "signing key" cache key, then check for it on cache.
    const signingKeyCacheKey = TMCache.getJwksSigningKeyCacheKey(jwtHeader);

    const cacheSigningKey = this._cache.getJwksSigningKey(signingKeyCacheKey);
    if (cacheSigningKey) {
      this._logger.log({ message: 'traffic token validation cached signing key  ' });
      callback(null, cacheSigningKey);
      return;
    }

    // Get signing key manually.
    this._jwksClient.getSigningKey(jwtHeader.kid, (error, key) => {
      if (error) {
        this._logger.error({ error, message: 'traffic token validation get signing key error ' });

        callback(error);
      } else {
        const signingKey = (key as jwksRsaClient.CertSigningKey).publicKey || (key as jwksRsaClient.RsaSigningKey).rsaPublicKey;
        this._logger.log({ message: 'traffic token validation get signing key success ' });
        this._cache.saveJwksSigningKey(signingKeyCacheKey, signingKey);

        callback(null, signingKey);
      }
    });
  }
}
