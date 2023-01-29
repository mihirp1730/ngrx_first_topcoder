import { Logger } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { v4 as uuid } from 'uuid';

import { ValidatorAbstract } from './validator.abstract';

class ValidatorTest extends ValidatorAbstract<number> {
  public validate(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  protected _getCacheKey(key: string): string {
    return key;
  }
}

describe('ValidatorAbstract Tests', () => {
  let mockLogger: Logger;
  let mockNodeCache: NodeCache;
  let validatorTest: ValidatorTest;

  beforeEach(() => {
    mockLogger = {
      log: () => null
    } as unknown as Logger;
    mockNodeCache = {
      del: () => null
    } as unknown as NodeCache;
    validatorTest = new ValidatorTest(mockLogger, mockNodeCache);
  });

  it('should be created', () => {
    expect(validatorTest).toBeTruthy();
  });

  describe('invalidateOnCache', () => {
    it('should invalidate the item', async () => {
      const mockItem = uuid();
      const spy = jest.spyOn(mockNodeCache, 'del').mockImplementation();
      validatorTest.invalidateOnCache(mockItem);
      expect(spy).toHaveBeenCalledWith(mockItem);
    });
  });
});
