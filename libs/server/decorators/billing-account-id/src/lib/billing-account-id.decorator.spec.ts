import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuid } from 'uuid';

import { DEFAULT_HEADER_KEY, BillingAccountIdLogic } from './billing-account-id.decorator';

describe('BillingAccountIdLogic', () => {
  let mockCtx: ExecutionContext;
  let mockRequest: Request;
  let mockValue: string;

  beforeEach(() => {
    mockValue = uuid();
    mockCtx = {
      switchToHttp: () => ({
        getRequest: () => mockRequest
      })
    } as unknown as ExecutionContext;
    mockRequest = {
      headers: {
        [DEFAULT_HEADER_KEY]: mockValue
      }
    } as unknown as Request;
  });

  it('should return a provided billing account id', () => {
    const billingAccountId = BillingAccountIdLogic({}, mockCtx);
    expect(billingAccountId).toBe(mockValue);
  });

  it('should handle a non-http calls', () => {
    mockCtx = {
      switchToHttp: () => null
    } as unknown as ExecutionContext;
    const billingAccountId = BillingAccountIdLogic({}, mockCtx);
    expect(billingAccountId).toBe(null);
  });

  it('should handle no options', () => {
    const billingAccountId = BillingAccountIdLogic(undefined, mockCtx);
    expect(billingAccountId).toBe(mockValue);
  });

  it('should use a headerKey option', () => {
    const mockHeaderKey = uuid();
    mockRequest = {
      headers: {
        [mockHeaderKey]: mockValue
      }
    } as unknown as Request;
    const billingAccountId = BillingAccountIdLogic({
      headerKey: mockHeaderKey
    }, mockCtx);
    expect(billingAccountId).toBe(mockValue);
  });

  it('should handle no headers', () => {
    mockRequest = { } as unknown as Request;
    const billingAccountId = BillingAccountIdLogic({}, mockCtx);
    expect(billingAccountId).toBe(null);
  });

  it('should throw if required and no headers', () => {
    mockRequest = { } as unknown as Request;
    expect(() => BillingAccountIdLogic({
      required: true
    }, mockCtx)).toThrow();
  });

});
