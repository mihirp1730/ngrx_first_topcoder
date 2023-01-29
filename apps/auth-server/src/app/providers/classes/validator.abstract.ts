import { GaiaTraceClass } from '@apollo/tracer';
import { Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';

/**
 * Common abstract class with common validation and cache methods for use
 * in validation classes.
 *
 * Pattern was inherited from `call-validation-service` migration/port.
 *
 * Generics:
 * - `O`: Validation options parameter type.
 * - `R`: Validation result type.
 */
@GaiaTraceClass
export abstract class ValidatorAbstract<O, R = any> {
  /**
   * Constructor for common validator properties.
   */
  constructor(protected _logger: Logger, protected _nodeCache: NodeCache) {}

  /**
   * Method used to validate given the validator supported options.
   *
   * Specified by `ValidatorAbstract` class.
   */
  public abstract validate(options: O): Promise<R>;

  // Cache related. ===============================================================

  /** Gets the key used for cache operations. */
  protected abstract _getCacheKey(value: string): string;

  /**
   * Removes one of the items handled by the validator from its cache.
   * @param item Element to remove from cache.
   */
  public invalidateOnCache(item: string): void {
    this._logger.log({ message: 'Validator: invalidating cache', key: item });

    const cacheKey = this._getCacheKey(item);
    this._nodeCache.del(cacheKey);

    this._logger.log({ message: 'Validator: cache invalidated', cacheKey });
  }
}
