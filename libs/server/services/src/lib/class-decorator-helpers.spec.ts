/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

import { isFunction } from 'lodash';

import { ClassDecoratorHelpers, GenericMethod } from './class-decorator-helpers';

describe('ClassDecoratorHelpers', () => {
  it('wrapAllMethods', () => {
    const mockFn = jest.fn();

    const totalMockCalls = 10;
    class Test {
      do() {}
      ra() {}
      me() {}
      fa() {}
      sol() {}
      la() {}
      private si() {}

      static eeny() {}
      static meeny() {}
      static mo() {}
    }

    ClassDecoratorHelpers.wrapAllMethods(
      Test,
      (_1: string, _2: string, method: GenericMethod): GenericMethod => {
        return (...args: any[]): any => {
          method.apply(this, ...args);
          mockFn();
        };
      }
    );

    const filterMethods = ([propertyName, {value}]: [
      string,
      PropertyDescriptor
    ]) => isFunction(value) && propertyName !== 'constructor';

    // Call class methods
    Object.entries(Object.getOwnPropertyDescriptors(Test.prototype))
      .filter(filterMethods)
      .reduce(
        (
          instance: Test,
          [propertyName]: [string, PropertyDescriptor]
        ): Test => {
          instance[propertyName]();
          return instance;
        },
        new Test()
      );

    // Call static methods
    Object.entries(Object.getOwnPropertyDescriptors(Test))
      .filter(filterMethods)
      .forEach(([propertyName]: [string, PropertyDescriptor]) =>
        Test[propertyName]()
      );

    expect(mockFn).toHaveBeenCalledTimes(totalMockCalls);
  });
});
