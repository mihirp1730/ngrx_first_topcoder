import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response } from 'express';

/* istanbul ignore next */
export class ServerRequestContextModel {
  static asyncLocalStorage = new AsyncLocalStorage<ServerRequestContextModel>();

  static currentContext() {
    return this.asyncLocalStorage.getStore();
  }

  constructor(public readonly req: Request, public readonly res: Response) {
  }
}
