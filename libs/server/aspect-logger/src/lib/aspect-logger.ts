import { afterMethod, beforeMethod, Metadata, onThrowOfMethod } from 'aspect.js';
import { MethodSelector } from 'aspect.js/src/join_points';

export interface ILogger {
  log(message: string): void;
  error(message: string): void;
}

/* istanbul ignore next */
const noop = () => void 0;

export class AspectLogger {
  private static readonly pattern: MethodSelector = {
    classNamePattern: /.*/,
    methodNamePattern: /.*/,
  };

  private static instance: ILogger = {
    log: noop,
    error: noop,
  };

  static get logger(): ILogger {
    return this.instance;
  }
  static set logger(l: ILogger) {
    this.instance = l;
  }

  static HandleAnyTypes(input: any): string {
    if (input instanceof Promise) {
      return '[instanceof Promise]'
    }
    return JSON.stringify(input);
  }

  @beforeMethod(AspectLogger.pattern)
  before(meta: Metadata) {
    const args = AspectLogger.HandleAnyTypes(meta.method.args);
    AspectLogger.logger.log(`Entering ${meta.className}.${meta.method.name} | args: ${args}`);
  }

  @afterMethod(AspectLogger.pattern)
  after(meta: Metadata) {
    const result = AspectLogger.HandleAnyTypes(meta.method.result);
    AspectLogger.logger.log(`Exiting ${meta.className}.${meta.method.name} | result: ${result}`);
  }

  // Need to be careful using this aspect, this can silently catch errors for us,
  // so we must rethrow the error to resume expected bubbling of the error
  @onThrowOfMethod(AspectLogger.pattern)
  throw(meta: Metadata) {
    const error = AspectLogger.HandleAnyTypes(meta.method.exception);
    AspectLogger.logger.error(`Throwing ${meta.className}.${meta.method.name} | error: ${error}`);
    throw meta.method.exception;
  }
}
