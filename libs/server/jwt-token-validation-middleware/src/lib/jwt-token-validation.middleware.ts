import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { RequestHandler } from 'express';
import { VerifyOptions } from 'jsonwebtoken';
import { Options as JwksRsaOptions } from 'jwks-rsa';
import jwksClient = require('jwks-rsa');
import { keys } from 'lodash';

import { GetKeyFactory } from './factories/get-key.factory';
import { JwtTokenValidationFactory } from './factories/jwt-token-validation.factory';
import { VerifyFactory } from './factories/verify.factory';

export function JwtTokenValidationMiddleware(
  options: {
    production: boolean;
    jwksUri: string;
    jwksClientOptions?: Partial<JwksRsaOptions>;
    verifyOptions?: Partial<VerifyOptions>;
  }
): RequestHandler {

  // If we're not in production, then we don't care about true validation,
  // just return a middleware that parses the JWT token...
  if (!options.production) {
    return JwtTokenMiddleware as unknown as RequestHandler;
  }

  // Normalize underlying dependency input/options... we'll spread them
  // further below, so we want normal/JavaScript objects.
  if (!options.jwksClientOptions || !keys(options.jwksClientOptions).length) {
    options.jwksClientOptions = {};
  }
  if (!options.verifyOptions || !keys(options.verifyOptions).length) {
    options.verifyOptions = {};
  }
  if (typeof options.verifyOptions.audience === 'string') {
    options.verifyOptions.audience = options.verifyOptions.audience.split(',');
  }

  const client = jwksClient({
    jwksUri: options.jwksUri,
    ...options.jwksClientOptions,
  });
  return JwtTokenValidationFactory(
    VerifyFactory(),
    GetKeyFactory(client),
    options.verifyOptions
  );
}
