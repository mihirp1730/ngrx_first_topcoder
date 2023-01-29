import { GaiaTraceClass } from '@apollo/tracer';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import { ServerRequestContextModel } from './server-request-context.model';

/**
 * This is needed to side-step Nest.js, which doesn't support getting the current execution context (i.e. Request) that's
 * not from the Controller handles directly (and passing it down explicitly). This means that things like a Logger can't
 * use DI to get the current user (if any).
 *
 * This solution is taken from https://github.com/nestjs/nest/issues/699#issuecomment-405868782.
 */
@Injectable()
@GaiaTraceClass
export class ServerRequestContextMiddleware implements NestMiddleware<Request, Response> {
  use(req: Request, res: Response, next: NextFunction) {
    ServerRequestContextModel.asyncLocalStorage.run(new ServerRequestContextModel(req, res), next);
  }
}
