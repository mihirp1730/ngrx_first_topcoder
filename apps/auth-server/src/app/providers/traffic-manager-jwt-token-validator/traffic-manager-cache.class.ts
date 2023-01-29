import { GaiaTraceClass } from '@apollo/tracer';
import { Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as NodeCache from 'node-cache';

/**
 * Cache facade for Traffic Manager, for use with a `NodeCache` cache instance.
 *
 * Purpose is to contain all the related values and methods for cache handling for Traffic Manager.
 *
 * It handles 2 different caching cases:
 * - Owr manual verified JWT token cache.
 * - The JWKS library "signing key" caching (for when the previous isn't valid).
 */
@GaiaTraceClass
export class TMCache {
  /** Value used as value filler of our `NodeCache` cache key-value map, as we really needed a set of keys. */
  private static readonly _cacheValue = true;

  private static readonly _jwksSigningKeyCacheTimeoutInMs = 15 * 60 * 1000;

  /**
   * Gets the cache key string for a JWKS "signing key",
   * given JWT verification headers.
   */
  static getJwksSigningKeyCacheKey(header: jwt.JwtHeader) {
    return `SigningKeyCacheKey-${header.kid}`;
  }

  /**
   * Gets the key used for cache operations based on JWT token.
   */
  static getJwtCacheKey(jwtToken: string): string {
    const hashedToken = TMCache._hashCode(jwtToken);
    return `traffic-manager-key=${hashedToken}`;
  }

  /**
   * Calculates a string hash code for a given string.
   * Used to generate a cache keys from JWT token strings.
   */
  private static _hashCode(value: string): string {
    let hash = 0;
    let i: number;
    let chr: number;

    if (!value || value.length === 0) {
      throw Error('wrong value');
    }

    for (i = 0; i < value.length; i++) {
      chr = value.charCodeAt(i);
      // tslint:disable-next-line:no-bitwise
      hash = (hash << 5) - hash + chr;
      // tslint:disable-next-line:no-bitwise
      hash |= 0;
    }

    return hash.toString();
  }

  constructor(private _logger: Logger, private _nodeCache: NodeCache) {}

  // Cache handling methods for Traffic Manager's top verification layer.

  /**
   * Saves a valid JWT key on cache.
   */
  saveValidJwtCacheKey(cacheKey: string, jwtExpiration: number): void {
    const expiresIn = jwtExpiration - Math.round(new Date().getTime() / 1000);
    const expirationTimeoutMs = expiresIn * 1000 - 5 * 60 * 1000;
    this._logger.log({ message: 'inserting into cache!', expirationTimeoutMs, cacheKey });

    this._nodeCache.set<boolean>(cacheKey, TMCache._cacheValue, expirationTimeoutMs);
  }

  /**
   * Gets if a JWT key is valid (checking if exists on cache, and has not expired yet).
   */
  isJwtCacheKeyValid(cacheKey: string): boolean {
    return this._nodeCache.has(cacheKey);
  }

  // Cache handling methods for Traffic Manager's internal JWKS library manual verification layer.

  /**
   * Saves a manually generated JWKS signing key on cache.
   */
  saveJwksSigningKey(cacheKey: string, signingKey: string): void {
    this._nodeCache.set(cacheKey, signingKey, TMCache._jwksSigningKeyCacheTimeoutInMs);
  }

  /**
   * Tries to get a cached "signing key", or returns `undefined` if not exists (or has expired.).
   * @param cacheKey A "signing key" cache key.
   */
  getJwksSigningKey(cacheKey: string): string | undefined {
    return this._nodeCache.get<string>(cacheKey);
  }
}
