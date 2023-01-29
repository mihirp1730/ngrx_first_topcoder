import { JwtTokenMiddleware } from '@apollo/server/jwt-token-middleware';
import { GaiaTraceClass } from '@apollo/tracer';
import { Inject, Injectable } from '@nestjs/common';
import { get } from 'lodash';

import { ServerRequestContextModel } from './server-request-context.model';
import * as tokens from './server-request-context.tokens';

@Injectable()
@GaiaTraceClass
export class ServerRequestContextService {
  constructor(
    @Inject(tokens.SERVER_REQUEST_CONTEXT_FACTORY_TOKEN)
    public readonly serverRequestContextFactory: () => ServerRequestContextModel
  ) {
  }

  contextualHeaders(): Record<string, string> {
    const { req } = this.serverRequestContextFactory() ?? {};
    const headers: Record<string, any> = {};
    
    // If the original request object has an 'id' then we treat this
    // as the 'x-request-id' to pass to and from other services.
    headers['X-Request-Id'] = get(req, 'id');

    // Return any added headers from above:
    return headers;
  }

  requesterAccessToken(): string | null {
    const { req } = this.serverRequestContextFactory() ?? {};
    if (!req) {
      return null;
    }
    return JwtTokenMiddleware.getToken(req) ?? null;
  }

}
