import { Provider } from '@nestjs/common';
import * as NodeCache from 'node-cache';

/**
 * Provides the app `NodeCache`.
 *
 * Inject with the same `NodeCache` module token from `'node-cache'`
 * (i.e. with `import * as NodeCache from 'node-cache';`).
 */
export const nodeCacheProvider: Provider<NodeCache> = {
  provide: NodeCache,
  // When (and if nedeed), modify to permit inject node cache options.
  useFactory: () => new NodeCache()
};
