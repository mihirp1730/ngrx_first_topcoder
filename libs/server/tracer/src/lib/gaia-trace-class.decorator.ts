/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ClassDecoratorHelpers, GenericMethod } from '@apollo/server/services';
import { Span } from 'nestjs-otel';

class TraceUtils {
  static wrap(
    className: string,
    methodName: string,
    method: GenericMethod
  ): GenericMethod {
    class Wrapper {
      @Span(`${className}_${methodName}`.toUpperCase())
      static unwrap(...args: any[]): any {
        return method.apply(this, args);
      }
    }
    return Wrapper.unwrap;
  }
}

export function GaiaTraceMethod(
  target: { constructor: Function },
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  descriptor.value = TraceUtils.wrap(
    target.constructor.name,
    String(propertyKey),
    descriptor.value);
}

// Note: NestJS's Controller Class Decorator does not play well with other Class Decorators
// Please use the above Method Decorator to apply spans to API Controller methods!
export function GaiaTraceClass(target: Function) {
  ClassDecoratorHelpers.wrapAllMethods(
    target,
    (name: string, propertyName: string, method: GenericMethod): GenericMethod =>
      TraceUtils.wrap(name, propertyName, method));
}

