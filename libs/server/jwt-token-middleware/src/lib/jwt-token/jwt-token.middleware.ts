import { HttpService } from '@nestjs/axios';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as jose from 'jose';
import { decode, Jwt } from 'jsonwebtoken';
import { get, set } from 'lodash';
import { IJwtTokenCertResponse, IOpenIdConfigurationResponse } from './sauth.interface';

@Injectable()
export class JwtTokenMiddleware implements NestMiddleware {
  constructor(public readonly http: HttpService) {}

  public static getToken(req: Request) {
    if (req.headers?.authorization) {
      const authorizationPair = req.headers.authorization.split(' ');
      if (authorizationPair[0] === 'Bearer') {
        return authorizationPair[1];
      }
    }
    if (req.cookies?.token) {
      return req.cookies.token;
    }
    if (req.cookies?.jwt_access) {
      return req.cookies.jwt_access;
    }
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const sAuthToken = JwtTokenMiddleware.getToken(req);
    let errorCode;
    if (sAuthToken) {
      try {
        const jwtPayload: Jwt = decode(sAuthToken, { complete: true });
        const openIdConfiguration = (await this.http
          .get(`${jwtPayload.payload['iss']}/.well-known/openid-configuration`)
          .toPromise()) as IOpenIdConfigurationResponse;
        const jwtCerts = (await this.http.get(openIdConfiguration.data.jwks_uri).toPromise()) as IJwtTokenCertResponse;
        const { alg, kty, n, e } = jwtCerts.data.keys.find((cert) => cert.kid === jwtPayload.header.kid);
        const jwk = {
          kty,
          n,
          e
        };
        const publicKey = await jose.importJWK(jwk, alg);
        const { payload } = await jose.jwtVerify(sAuthToken, publicKey);
        set(req, 'session', payload);
      } catch (err) {
        errorCode = err.name;
        set(req, 'session', null);
      }
    }
    if (get(req, 'session')) {
      next();
    } else {
      if (errorCode.toLowerCase() === 'jwtexpired' || errorCode.toLowerCase() === 'jwssignatureverificationfailed') {
        res.status(401).send({ error: 'Invalid sAuth token' });
      }
      res.status(403).send({ error: 'No sAuth token' });
    }
  }
}
