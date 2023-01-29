import { NextFunction, Request, RequestHandler, Response } from 'express';
import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { set } from 'lodash';
import { verify, GetPublicKeyOrSecret, VerifyOptions } from 'jsonwebtoken';

export function JwtTokenValidationFactory(
  verifyFactory: () => typeof verify,
  getKeyFactory: () => GetPublicKeyOrSecret,
  verifyOptions: Partial<VerifyOptions>
): RequestHandler {
  const verify = verifyFactory();
  const getKey = getKeyFactory();
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    if (req.method === 'OPTIONS') {
      return next();
    }

    const token = JwtTokenMiddleware.getToken(req);

    verify(token, getKey, verifyOptions, (err, decoded) => {
      if (err) {
        res.status(400).send({
          error: `Authorization was not a valid JWT token: ${err.message}`
        });
      } else if (!decoded) {
        res.status(400).send({
          error: 'Authorization was not a valid JWT token: no data was received'
        });
      } else {
        set(req, 'session', decoded);
        next();
      }
    });
  };
}
