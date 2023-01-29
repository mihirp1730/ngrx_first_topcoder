import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { v4 as uuid } from 'uuid';

import { JwtTokenValidationMiddleware } from './jwt-token-validation.middleware';

describe('JwtTokenValidationMiddleware', () => {

  it('should return JwtTokenMiddleware if non-production', () => {
    const result = JwtTokenValidationMiddleware( {
      production: false,
      jwksUri: uuid()
    });
    expect(result).toBe(JwtTokenMiddleware);
  });

  it('should return JwtTokenMiddleware if non-production', () => {
    const result = JwtTokenValidationMiddleware( {
      production: false,
      jwksUri: uuid()
    });
    expect(result).toBe(JwtTokenMiddleware);
  });

  it('should return JwtTokenValidationFactory', () => {
    const result = JwtTokenValidationMiddleware( {
      production: true,
      jwksUri: uuid()
    });
    expect(result).toBeTruthy();
  });

  it('should handle empty options', () => {
    const result = JwtTokenValidationMiddleware( {
      production: true,
      jwksUri: uuid(),
      jwksClientOptions: {},
      verifyOptions: {}
    });
    expect(result).toBeTruthy();
  });

  it('should handle normal options', () => {
    const result = JwtTokenValidationMiddleware( {
      production: true,
      jwksUri: uuid(),
      jwksClientOptions: {
        cache: false
      },
      verifyOptions: {
        ignoreExpiration: true
      }
    });
    expect(result).toBeTruthy();
  });

});
