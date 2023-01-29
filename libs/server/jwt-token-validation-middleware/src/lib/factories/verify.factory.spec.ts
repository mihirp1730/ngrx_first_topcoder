import { verify } from 'jsonwebtoken';

import { VerifyFactory } from './verify.factory';

describe('VerifyFactory', () => {
  it('should return the `verify` from the `jsonwebtoken` package', () => {
    expect(VerifyFactory()()).toBe(verify);
  });
});
