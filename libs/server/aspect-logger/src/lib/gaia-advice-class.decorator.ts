import { weave } from 'aspect.js/src/core/advised';

/* istanbul ignore next */
export function GaiaAdviseClass(config?: any): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function<TFunction extends Function>(target: TFunction) {
    return weave(target, config);
  };
}
