import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';

interface BillingAccountIdOptions {
  headerKey?: string;
  required?: boolean;
  missingResponse?: string;
  missingStatus?: HttpStatus;
}

export const DEFAULT_HEADER_KEY = 'billingaccountid';

export const BillingAccountIdLogic = (options: BillingAccountIdOptions, ctx: ExecutionContext) => {
  // Support HTTP requests, quit if not HTTP:
  const request = ctx.switchToHttp()?.getRequest() as Request;
  if (!request) {
    return null;
  }

  // Look for the header and return if found:
  const headerKey = options?.headerKey ?? DEFAULT_HEADER_KEY;
  const billingAccountId = request.headers?.[headerKey];
  if (billingAccountId) {
    return billingAccountId;
  }

  // Otherwise handle the not-found header:
  if (options?.required === true) {
    const missingResponse = options.missingResponse ?? `No ${headerKey} header provided.`;
    const missingStatus = options.missingStatus ?? HttpStatus.UNAUTHORIZED;
    throw new HttpException(missingResponse, missingStatus);
  }
  return null;
}

export const BillingAccountId = createParamDecorator(BillingAccountIdLogic);
