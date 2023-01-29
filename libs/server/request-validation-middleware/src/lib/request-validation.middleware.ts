import { Injectable, NestMiddleware } from '@nestjs/common';
import { createLogger, requestValidationMiddlewere } from '@slb-delfi-exploration/dd-infrastructure';
import { Request, Response, NextFunction } from 'express';
import NodeCache = require('node-cache');

import { GetRequestValidationsConfig } from './get-request-validation-config';

export function RequestValidationMiddleware(loggerService: string, processEnv: NodeJS.ProcessEnv, skipPaths: string[] = []): any {
  const config = GetRequestValidationsConfig(processEnv);
  const nodeCache = new NodeCache();
  const options = { stopFailedRequests: true };
  const logger = createLogger(loggerService);
  const middlewareInstance = requestValidationMiddlewere(config, nodeCache, logger, options);

  @Injectable()
  class RequestValidationMiddlewareContainer implements NestMiddleware {
    // TODO: we need to ultimately replace @slb-delfi-exploration/dd-infrastructure with a proper pioneer middleware lib
    /* istanbul ignore next */
    use(req: Request, response: Response, next: NextFunction) {
      if (skipPaths.includes(req.baseUrl)) {
        next();
      } else {
        middlewareInstance(req, response, next);
      }
    }
  }

  return RequestValidationMiddlewareContainer;
}
